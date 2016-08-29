
#include <cstdio>
#include <cstdlib>
#include <cstring>

#include <algorithm>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include <lilv/lilv.h>
#include <lv2/lv2plug.in/ns/ext/atom/atom.h>
#include <lv2/lv2plug.in/ns/ext/buf-size/buf-size.h>
#include <lv2/lv2plug.in/ns/ext/options/options.h>
#include <lv2/lv2plug.in/ns/ext/presets/presets.h>
#include <lv2/lv2plug.in/ns/ext/state/state.h>
#include <lv2/lv2plug.in/ns/ext/uri-map/uri-map.h>
#include <lv2/lv2plug.in/ns/ext/worker/worker.h>

typedef struct {
    const char* symbol;
    float value;
} StatePortValue;

// --------------------------------------------------------------------------------------------------------------------

static std::vector<std::string> g_handled_bundles;
static std::vector<std::string> g_uri_mapping = {
    LV2_ATOM__Int,
    LV2_ATOM__Long,
    LV2_ATOM__Float,
    LV2_ATOM__Double,
    LV2_BUF_SIZE__maxBlockLength,
    LV2_BUF_SIZE__minBlockLength,
};

// note: the ids below must match the ones on the mapping
static const uint32_t k_urid_null         =  0;
static const uint32_t k_urid_atom_int     =  1;
static const uint32_t k_urid_atom_long    =  2;
static const uint32_t k_urid_atom_float   =  3;
static const uint32_t k_urid_atom_double  =  4;
static const uint32_t k_urid_atom_bz_max  =  5;
static const uint32_t k_urid_atom_bz_min  =  6;

static const int32_t g_buffer_size = 128;
static const double g_sample_rate = 48000.0;

static void* g_user_data = (void*)0x1; // non-null

// --------------------------------------------------------------------------------------------------------------------

static LV2_Options_Option g_options[] = {
    {
        LV2_OPTIONS_INSTANCE,
        0,
        k_urid_atom_bz_max,
        sizeof(int32_t),
        k_urid_atom_int,
        &g_buffer_size
    },
    {
        LV2_OPTIONS_INSTANCE,
        0,
        k_urid_atom_bz_min,
        sizeof(int32_t),
        k_urid_atom_int,
        &g_buffer_size
    }
};

static LV2_Feature g_options_feature = {
    LV2_OPTIONS__options, g_options
};

// --------------------------------------------------------------------------------------------------------------------

static LV2_URID lv2_urid_map(LV2_URID_Map_Handle, const char* const uri_)
{
    if (uri_ == nullptr || uri_[0] == '\0')
        return 0;

    const std::string uri(uri_);

    LV2_URID urid = 1;
    for (const std::string& uri2 : g_uri_mapping)
    {
        if (uri2 == uri)
            return urid;
        ++urid;
    }

    g_uri_mapping.push_back(uri);
    return urid;
}

static LV2_URID_Map g_urid_map = {
    g_user_data, lv2_urid_map
};

static LV2_Feature g_urid_map_feature = {
    LV2_URID__map, &g_urid_map
};

// --------------------------------------------------------------------------------------------------------------------

static uint32_t lv2_uri_to_id(LV2_URI_Map_Callback_Data handle, const char*, const char* uri)
{
    return lv2_urid_map(handle, uri);
}

static LV2_URI_Map_Feature g_uri_map = {
    g_user_data, lv2_uri_to_id
};

static LV2_Feature g_uri_map_feature = {
    LV2_URI_MAP_URI, &g_uri_map
};

// --------------------------------------------------------------------------------------------------------------------

static const char* lv2_urid_unmap(LV2_URID_Unmap_Handle, const LV2_URID urid)
{
    if (urid == 0 || urid >= g_uri_mapping.size())
        return NULL;

    return g_uri_mapping[urid-1].c_str();
}

static LV2_URID_Unmap g_urid_unmap = {
    g_user_data, lv2_urid_unmap
};

static LV2_Feature g_urid_unmap_feature = {
    LV2_URID__unmap, &g_urid_unmap
};

// --------------------------------------------------------------------------------------------------------------------

static LV2_Worker_Status lv2_worker_schedule(LV2_Worker_Schedule_Handle, uint32_t, const void*)
{
    return LV2_WORKER_SUCCESS;
}

static LV2_Worker_Schedule g_worker = {
    g_user_data, lv2_worker_schedule
};

static LV2_Feature g_worker_feature = {
    LV2_WORKER__schedule, &g_worker
};

// --------------------------------------------------------------------------------------------------------------------

static const LV2_Feature* g_features[] = {
    &g_options_feature,
    &g_urid_map_feature,
    &g_uri_map_feature,
    &g_urid_unmap_feature,
    &g_worker_feature,
    NULL
};

// --------------------------------------------------------------------------------------------------------------------

static const void* get_port_value_for_state(const char* const symbol, void* user_data, uint32_t* size, uint32_t* type)
{
    const std::vector<StatePortValue>& values = *(std::vector<StatePortValue>*)user_data;

    for (const StatePortValue& value : values)
    {
        if (strcmp(value.symbol, symbol) != 0)
            continue;

        *size = sizeof(float);
        *type = k_urid_atom_float;
        return &value.value;
    }

    return NULL;
}

static void set_port_value_for_state(const char* const symbol, void* const user_data, const void* value, uint32_t size, uint32_t type)
{
    std::vector<StatePortValue>* const values = (std::vector<StatePortValue>*)user_data;

    switch (type)
    {
    case k_urid_atom_int:
        if (size == sizeof(int32_t))
        {
            int32_t ivalue = *(const int32_t*)value;
            values->push_back({ strdup(symbol), (float)ivalue });
            return;
        }
        break;

    case k_urid_atom_long:
        if (size == sizeof(int64_t))
        {
            int64_t ivalue = *(const int64_t*)value;
            values->push_back({ strdup(symbol), (float)ivalue });
            return;
        }
        break;

    case k_urid_atom_float:
        if (size == sizeof(float))
        {
            float fvalue = *(const float*)value;
            values->push_back({ strdup(symbol), fvalue });
            return;
        }
        break;

    case k_urid_atom_double:
        if (size == sizeof(double))
        {
            double dvalue = *(const double*)value;
            values->push_back({ strdup(symbol), (float)dvalue });
            return;
        }
        break;
    }

    fprintf(stderr, "set_port_value_for_state for port '%s' called with unknown type '%s' (num:%u, size:%u)\n", symbol, lv2_urid_unmap(NULL, type), type, size);
}

// --------------------------------------------------------------------------------------------------------------------

void create_plugin_preset(LilvWorld* const world, const LilvPlugin* const plugin)
{
    const LilvNode* const uri = lilv_plugin_get_uri(plugin);

    if (lilv_world_load_resource(world, uri) < 0)
    {
        fprintf(stderr, "failed to parse plugin '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    const LilvNode* const bundle = lilv_plugin_get_bundle_uri(plugin);

    if (bundle == NULL)
    {
        fprintf(stderr, "failed to get bundle for '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    char* const bundlepath = lilv_file_uri_parse(lilv_node_as_uri(bundle), NULL);

    if (bundlepath == NULL)
    {
        fprintf(stderr, "failed to get bundle path for '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    LilvState* state = lilv_state_new_from_world(world, &g_urid_map, uri);

    if (state == NULL)
    {
        lilv_free(bundlepath);
        fprintf(stderr, "failed to get state for '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    LilvInstance* const instance = lilv_plugin_instantiate(plugin, g_sample_rate, g_features);

    if (instance != NULL)
    {
#if 0
        float buffer[g_buffer_size];
        memset(buffer, 0, sizeof(float)*g_buffer_size);

        for (uint32_t i=0, count=lilv_plugin_get_num_ports(plugin); i<count; ++i)
        {
            // FIXME: adjust to other port types
            lilv_instance_connect_port(instance, i, buffer);
        }

        lilv_instance_activate(instance);
        lilv_instance_run(instance, g_buffer_size);
#endif

        std::vector<StatePortValue> values;
        lilv_state_emit_port_values(state, set_port_value_for_state, &values);

        lilv_state_free(state);
        state = lilv_state_new_from_instance(plugin, instance, &g_urid_map,
                                             bundlepath, bundlepath, bundlepath, bundlepath,
                                             get_port_value_for_state, &values, LV2_STATE_IS_POD|LV2_STATE_IS_PORTABLE, NULL);
    }

    std::string preseturi("default-preset");
    const std::string sbundlepath(bundlepath);
    const size_t count = std::count(g_handled_bundles.begin(), g_handled_bundles.end(), sbundlepath);

    if (count != 0)
    {
        preseturi += "_";
        preseturi += std::to_string(count);
    }

    char* const string = lilv_state_to_string(world, &g_urid_map, &g_urid_unmap, state, preseturi.c_str(), NULL);

    if (string == NULL)
    {
        lilv_free(bundlepath);
        lilv_state_free(state);
        fprintf(stderr, "failed to get state string for '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    std::fstream presetfile(sbundlepath + "/default-preset.ttl", (count == 0) ? std::ios::out : std::ios::out|std::ios::app);

    if (count == 0)
    {
        presetfile << "@prefix lv2:   <" LV2_CORE_PREFIX "> .\n";
        presetfile << "@prefix pset:  <" LV2_PRESETS_PREFIX "> .\n";
        presetfile << "@prefix state: <" LV2_STATE_PREFIX "> .\n";
        presetfile << "\n";
    }

    g_handled_bundles.push_back(sbundlepath);

    presetfile << string;
    presetfile << "\n";
    presetfile.close();

    bool manifestupdated = false;

    std::string line, compare("<" + preseturi + ">");
    for (std::fstream stream(sbundlepath + "/manifest.ttl"); std::getline(stream, line) && ! manifestupdated;)
    {
        if (line.find(compare) != std::string::npos)
            manifestupdated = true;
    }

    if (! manifestupdated)
    {
        std::fstream manifestfile(sbundlepath + "/manifest.ttl", std::ios::out|std::ios::app);
        manifestfile << "\n";
        manifestfile << "<" << preseturi << ">\n";
        manifestfile << "    a <" LV2_PRESETS__Preset "> ;\n";
        manifestfile << "    <" LV2_CORE__appliesTo "> <" << lilv_node_as_uri(uri) << "> ;\n";
        manifestfile << "    <" LILV_NS_RDFS "label> \"Default\" ;\n";
        manifestfile << "    <" LILV_NS_RDFS "seeAlso> <default-preset.ttl> .\n";
        manifestfile.close();
    }

    lilv_free(string);
    lilv_free(bundlepath);
    lilv_state_free(state);

    if (instance != NULL)
    {
#if 0
        lilv_instance_deactivate(instance);
#endif
        lilv_instance_free(instance);
    }
}

// --------------------------------------------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    if (argc < 2)
    {
        fprintf(stdout, "usage: %s <lv2-folder>\n", argv[0]);
        return 1;
    }

    char* lv2_folder = argv[1];

#if 0
    stat(s);
    stat.S_ISDIR(st.st_mode);

    if (not os.path.isdir(lv2_folder))
    {
        print("error: not a folder: '%s'" % lv2_folder);
        return 2;
    }
#endif

    lv2_folder = realpath(lv2_folder, NULL);

    setenv("LV2_PATH", lv2_folder, 1);
    fprintf(stdout, "Using folder '%s'\n", lv2_folder);

    LilvWorld* const world = lilv_world_new();
    lilv_world_load_all(world);

    const LilvPlugins* const plugins = lilv_world_get_all_plugins(world);

    LILV_FOREACH(plugins, iter, plugins)
    {
        create_plugin_preset(world, lilv_plugins_get(plugins, iter));
    }

    lilv_world_free(world);
    free(lv2_folder);

    return 0;
}
