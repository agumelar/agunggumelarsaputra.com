/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('./utils/auth').UserSessionPayload | null;
  }
}
