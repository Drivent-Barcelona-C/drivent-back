import { ApplicationError } from "@/protocols";

export function cannotSubscribeInTwoActivitiesInTheSameTimeError(): ApplicationError {
  return {
    name: "cannotSubscribeActivity",
    message: "Cannot subscribe in two activities in same time error",
  };
}
