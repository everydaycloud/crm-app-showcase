#trailing slash means copy the contents, no trailing slash means copy the folder too

FROM node:22-bookworm-slim AS frontend

WORKDIR /frontend/ 
COPY staff/package.json staff/package-lock.json /frontend/
RUN npm install

COPY staff /frontend/
RUN npm run build

RUN echo "Dist contents:" && ls -la /frontend/dist


FROM python:3.13-slim-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init git

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

EXPOSE 8080
WORKDIR /app
COPY hypercorn.toml /app/
CMD ["pdm", "run", "hypercorn", "--config", "hypercorn.toml", "--bind", "0.0.0.0:${PORT}", "backend.run:create_app()"]

RUN python -m venv /ve
ENV PATH=/ve/bin:${PATH}
RUN pip install --no-cache-dir pdm

COPY backend/pdm.lock backend/pyproject.toml /app/
RUN pdm install --prod --no-lock --no-editable

COPY backend/src/ /app/

COPY --from=frontend /frontend/dist/index.html /app/backend/templates/
COPY --from=frontend /frontend/dist/assets/ /app/backend/static/


RUN echo "Templates:" && ls -la /app/backend/templates && \
    echo "Static:" && ls -la /app/backend/static


USER nobody
