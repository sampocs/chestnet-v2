bump-patch:
	@current=$$(jq -r '.expo.version' app.json); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	patch=$$(echo $$current | cut -d. -f3); \
	new="$$major.$$minor.$$((patch + 1))"; \
	jq --arg v "$$new" '.expo.version = $$v' app.json > app.json.tmp && mv app.json.tmp app.json; \
	echo "Bumped version: $$current -> $$new"

bump-minor:
	@current=$$(jq -r '.expo.version' app.json); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	new="$$major.$$((minor + 1)).0"; \
	jq --arg v "$$new" '.expo.version = $$v' app.json > app.json.tmp && mv app.json.tmp app.json; \
	echo "Bumped version: $$current -> $$new"

bump-and-build: bump-patch
	npx expo prebuild --platform ios --clean
	open ios/Chestnut.xcworkspace
