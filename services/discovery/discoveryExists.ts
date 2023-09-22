import { discoveryService } from ".";

export async function discoveryExists(_id: string): Promise<boolean> {
  return await discoveryService._exists({ _id });
}
