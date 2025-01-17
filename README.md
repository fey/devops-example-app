# devops-example-app

This is a simple node application that shows on the main page IP address of the server on which it is running.

## Requirements

* Node 15.x
* Make
## Install

```sh
make install
```

## Start application

```sh
make start
# open http://0.0.0.0:5000 in browser
```

You may pass environment variable `SERVER_IP`, and its value shows on the main page.

```sh
SERVER_IP="Hexlet Awesome Server" make start
# open http://0.0.0.0:5000 in browser
```

![Screen of devops-example-app](assets/app.png)

---
[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/hexletguides.github.io/master/images/hexlet_logo128.png)](https://ru.hexlet.io/pages/about?utm_source=github&utm_medium=link&utm_campaign=devops-example-app)

This repository is created and maintained by the team and the community of Hexlet, an educational project. [Read more about Hexlet (in Russian)](https://ru.hexlet.io/pages/about?utm_source=github&utm_medium=link&utm_campaign=devops-example-app).
