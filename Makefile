.PHONY: up down logs server-install server-build server-start server-dev server-test githuber-install githuber-build githuber-start githuber-dev githuber-watch githuber-clean

# Giran main commands
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

# Server commands
server-install:
	cd server && npm install

server-build:
	cd server && npm run build

server-start:
	cd server && npm run start

server-dev:
	cd server && npm run dev

server-test:
	cd server && npm run test

# Githuber commands
githuber-install:
	cd githuber && npm install

githuber-build:
	cd githuber && npm run build

githuber-start:
	cd githuber && npm run start

githuber-dev:
	cd githuber && npm run dev

githuber-watch:
	cd githuber && npm run watch

githuber-clean:
	cd githuber && npm run clean 