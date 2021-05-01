export default interface IRateLimiterProvider {
  consume(ip: string): Promise<void>;
}
