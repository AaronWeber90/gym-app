import { opfsDataClient } from "../features/opfs-storage/opfs-data-client";
import type { DataClient } from "./data-client";

export const dataClient: DataClient = opfsDataClient;
