export interface IConnectionOptions {
  url: string,
  options: {
    heartbeat: string | number
  }
}
