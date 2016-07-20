
#include <cstdio>
#include <cstdlib>

#include <algorithm>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include <lilv/lilv.h>

// --------------------------------------------------------------------------------------------------------------------

static std::vector<std::string> g_handled_bundles;
static std::vector<std::string> g_uri_mapping;

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

static LV2_URID_Map g_urid_map_feature = {
    NULL, lv2_urid_map
};

// --------------------------------------------------------------------------------------------------------------------

static const char* lv2_urid_unmap(LV2_URID_Unmap_Handle, const LV2_URID urid)
{
    if (urid >= g_uri_mapping.size())
        return NULL;

    return g_uri_mapping[urid].c_str();
}

static LV2_URID_Unmap g_urid_unmap_feature = {
    NULL, lv2_urid_unmap
};


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

    LilvState* const state = lilv_state_new_from_world(world, &g_urid_map_feature, uri);

    if (state == NULL)
    {
        lilv_free(bundlepath);
        fprintf(stderr, "failed to generate preset for '%s'\n", lilv_node_as_uri(uri));
        return;
    }

    std::string preseturi("default-preset");
    const std::string sbundlepath(bundlepath);
    const size_t count = std::count(g_handled_bundles.begin(), g_handled_bundles.end(), sbundlepath);

    if (count != 0)
    {
        preseturi += "_";
        preseturi += std::to_string(count);
    }

    char* const string = lilv_state_to_string(world, &g_urid_map_feature, &g_urid_unmap_feature, state, preseturi.c_str(), NULL);

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
        presetfile << "@prefix lv2:   <http://lv2plug.in/ns/lv2core#> .\n";
        presetfile << "@prefix pset:  <http://lv2plug.in/ns/ext/presets#> .\n";
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
        manifestfile << "    a <http://lv2plug.in/ns/ext/presets#Preset> ;\n";
        manifestfile << "    <http://lv2plug.in/ns/lv2core#appliesTo> <" << lilv_node_as_uri(uri) << "> ;\n";
        manifestfile << "    <http://www.w3.org/2000/01/rdf-schema#label> \"Default\" ;\n";
        manifestfile << "    <http://www.w3.org/2000/01/rdf-schema#seeAlso> <default-preset.ttl> .\n";
        manifestfile.close();
    }

    lilv_free(string);
    lilv_free(bundlepath);
    lilv_state_free(state);
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
