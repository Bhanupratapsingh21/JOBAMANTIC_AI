import { Client, Account, Databases } from "appwrite";

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // e.g., http://localhost/v1
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // your project ID

export const account = new Account(client);

export const database = new Databases(client);