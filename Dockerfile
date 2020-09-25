# Copyright 2020 Kaan Karakaya
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Install npm packages
FROM node:14-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install --prod

# Push js files
FROM node:14-alpine
WORKDIR /usr/src/app
LABEL maintainer="Kaan Karakaya <yusufkaan142@gmail.com>"
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY ./src ./src
CMD node src/index.js
