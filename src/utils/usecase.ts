export interface UseCase<Input, Result> {
  handle(input: Input): Promise<Result>;
}
