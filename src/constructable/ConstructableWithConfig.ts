export interface ConstructableWithConfig<Config, T> {
    new(config: Config) : T;
}