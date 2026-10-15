# Receipt Decoded backend ownership

- The production backend for Receipt Decoded runs in `/Users/mingyueding/Projects/little-moments`, mounted at `/receipt-decoded`.
- When a Receipt Decoded task changes server behavior, configuration, contracts or policies, make the corresponding changes in the Little Moments repository in the same task. Do not leave backend work only in this repository.
- Maintain the backend source here and sync the runtime with `pnpm backend:sync-little-moments`. Update Little Moments' `server/receipt-decoded-route.mjs`, namespaced configuration, documentation and integration tests as needed.
- Run the relevant checks in both repositories and the mobile/shared-server contract check. Preserve Little Moments' unrelated APIs, credentials, pricing and quotas, and keep receipt analysis and product lookup accounting separate.
- Do not push, deploy, change hosted settings or submit a release without explicit user approval.
