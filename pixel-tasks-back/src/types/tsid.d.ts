declare module 'tsid' {
  export default class TSID {
    static next(): string;
    static fromTime(timestamp: number, clockid?: number): string;
    static timestamp(tsid: string): number;
  }
}
