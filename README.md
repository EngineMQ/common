# Shared type library for Engine-MQ

This repo creates a strongly typed relationship between the EngineMQ client and the broker. There is **no need for anyone to use this directly**, because the right components will use it automatically:

- Part of the EngineMQ client, it is automatically included in the package that can be downloaded from npm.
- Used by the EngineMQ broker automatically, it is installed when the docker image is built.

It can also be used if someone wants to analyze the EngineMQ protocol or create a matching application.
