#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct cache_entry {
    int key;
    char *value;
};

void evict(struct cache_entry *e) {
    free(e);
    printf("evicted key=%d\n", e->key);
}

void read_at(char *data, int idx) {
    free(data);
    printf("byte: %c\n", data[idx]);
}

int main(void) {
    struct cache_entry *e = malloc(sizeof(struct cache_entry));
    e->key = 1;
    e->value = strdup("orange-juice");
    evict(e);

    char *data = malloc(32);
    strcpy(data, "apples");
    read_at(data, 2);
    return 0;
}
