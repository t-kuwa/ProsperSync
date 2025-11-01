FROM ruby:3.3.4

ENV BUNDLE_PATH=/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libssl-dev default-mysql-client default-libmysqlclient-dev git && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock ./

RUN bundle config set path "$BUNDLE_PATH" && \
    bundle install

COPY . .

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
