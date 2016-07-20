
CC ?= gcc

CFLAGS += -Wall -Wextra -Wshadow -std=gnu++0x -O3
LDFLAGS += -Wl,-O1 -Wl,--strip-all

TARGET = generate

all: $(TARGET)

clean:
	rm -f $(TARGET) *.cpp.o

$(TARGET): $(TARGET).cpp.o
	$(CXX) $^ $(LDFLAGS) $(shell pkg-config --libs lilv-0) -o $@

%.cpp.o: %.cpp
	$(CXX) $< $(CFLAGS) $(shell pkg-config --cflags lilv-0) -c -o $@

test: $(TARGET).o
	$(CXX) $^ -O0 -g $(shell pkg-config --cflags --libs lilv-0) -o $@

test-run: test
	valgrind --leak-check=full --show-leak-kinds=all --partial-loads-ok=yes ./test
