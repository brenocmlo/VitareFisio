import NodeCache from "node-cache";

// Cache padrão: Dados expiram em 5 minutos (300 segundos)
class Cache {
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set(key: string, value: any, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    del(key: string): number {
        return this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }
}

export const cache = new Cache();
