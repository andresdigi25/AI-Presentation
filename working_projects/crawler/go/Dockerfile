FROM golang:1.23-alpine
RUN apk add --no-cache git
WORKDIR /app
ENV HOME=/app
ENV GOCACHE=/app/.cache/go-build
ENV GOMODCACHE=/app/.cache/go-mod
COPY . .
RUN go mod tidy && go mod download
CMD ["go", "run", "main.go"]
