# AGENTS.md — python-rasenmaeher-mtxauthz (mtxauthz)

## Purpose
HTTP authorization hook service for MediaMTX video streaming in the Deploy App (RASENMAEHER)
ecosystem. MediaMTX delegates all `publish` and `read` authorization decisions to this FastAPI
service via HTTP callbacks. `rmmtxauthz` validates stream credentials against its PostgreSQL
database, enforcing who can publish and who can watch each stream. Also includes a web UI for
stream management.

## Stack & Key Technologies
- **Language:** Python 3.11
- **Framework:** FastAPI + Uvicorn
- **Database:** PostgreSQL `rmmtx` schema (stream credentials, permissions)
- **Testing:** pytest, pytest-docker (65% minimum coverage)
- **Linting:** pre-commit, pylint
- **Container:** Docker multi-target (devel_shell, tox, production)
- **Port:** 8005
- **Companion service:** bluenviron/mediamtx 1.12.3 (Go binary, separate container)

## Development Setup
```bash
export DOCKER_BUILDKIT=1
# Linux:
export DOCKER_SSHAGENT="-v $SSH_AUTH_SOCK:$SSH_AUTH_SOCK -e SSH_AUTH_SOCK"

# Build devel shell
docker build --ssh default --target devel_shell -t rmmtxauthz:devel_shell .
docker create --name rmmtxauthz_devel \
  -v "$(pwd):/app" \
  -it $(echo $DOCKER_SSHAGENT) rmmtxauthz:devel_shell
docker start -i rmmtxauthz_devel

# Key env vars:
# RMMTX_API_URL          — https://mtx.<domain>:9997 (MediaMTX control API)
# RMMTX_MTX_ADDRESS      — mtx.<domain>
# RMMTX_API_PASSWORD     — MediaMTX admin API password
# RMMTX_SRT_PUB_PASSWORD — SRT publish password
# RMMTX_SRT_READ_PASSWORD — SRT read password
# RMMTX_DATABASE_PASSWORD — PostgreSQL password
```

## Running Tests
```bash
# Via tox (CI, uses pytest-docker to spin up dependencies)
docker build --ssh default --target tox -t rmmtxauthz:tox .
docker run --rm -it -v $(pwd):/app $(echo $DOCKER_SSHAGENT) rmmtxauthz:tox

# Inside devel_shell
pytest tests/ -v --cov=rmmtxauthz --cov-fail-under=65

# Pre-commit
pre-commit install --install-hooks
pre-commit run --all-files
```

## Code Conventions
- Async-first: use async FastAPI endpoints
- Follow pylint rules from root `pylintrc`

## Architecture Notes
**MediaMTX auth flow:**
1. Client attempts to publish/read a stream
2. MediaMTX sends `POST` to `rmmtxauthz:8005/auth` with stream path + credentials
3. `rmmtxauthz` validates credentials against the `rmmtx` PostgreSQL schema
4. Returns `200` (allow) or `403` (deny)

**MediaMTX ports** (on `mediamtx` container, exposed to WAN):

| Port  | Protocol | Use                    |
|-------|----------|------------------------|
| 1936  | RTMPS    | Publish/read via RTMPS |
| 8322  | RTSPS    | Publish/read via RTSPS |
| 8890  | SRT      | Publish/read via SRT   |
| 9888  | HLS      | HLS playback           |
| 9889  | WebRTC   | WebRTC streaming       |
| 9996  | HTTP     | HLS recorded playback  |
| 9997  | HTTP     | MediaMTX admin API     |

**TLS:** MediaMTX uses Let's Encrypt certs from the `le_certs` volume (provided by miniwerk).

## Common Agent Pitfalls
1. **`pytest-docker` spins up real containers for integration tests.** Ensure Docker is
   running and the Docker socket is accessible when running the test suite. Tests that
   work locally may fail in CI if Docker-in-Docker is not configured.
3. **MediaMTX admin API (port 9997) is not publicly accessible.** It is on an internal
   Docker network only. Do not expose it through nginx. The `RMMTX_API_PASSWORD` protects it
   but exposure would still be a security risk.
4. **Auth decisions are synchronous blocking calls.** MediaMTX waits for the HTTP response
   from `rmmtxauthz` before allowing the stream. Slow DB queries will delay stream start.
   Keep the auth path simple and indexed.
5. **Coverage threshold is 65%.** Auth decision logic must have test coverage — this is
   security-critical code. Every auth bypass scenario needs a test.

## Related Repos
- https://github.com/pvarki/docker-rasenmaeher-integration (orchestration root)
- https://github.com/pvarki/python-rasenmaeher-api (user enrollment triggers stream credential creation)
