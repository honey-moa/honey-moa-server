# ❯ Honey Moa Server

![Honey-Moa-Server](assets/logo/188959312.jpeg)

![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fhoney-moa%2Fhoney-moa-server&count_bg=%233D81C8&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)

## ❯ 바로가기

- [ERD](assets/erd/ERD.svg)
- Architecture
  - [Prod Server Architecture](assets/architecture/prod-architecture.png)
  - [Dev Server Architecture](assets/architecture/dev-architecture.png)
- [Tech Stack](docs/TECH_STACK.md)
- [Commit Convention](docs/COMMIT_CONVENTION.md)
- [Branch Strategy](docs/BRANCH_STRATEGY.md)

## ❯ 목차

- [프로젝트 소개](#-프로젝트-소개)
  - [개발 기간](#-개발-기간)
  - [관련 Repository](#-관련-repository)
  - [서비스 사이트](#-서비스-사이트)
  - [팀원](#-팀원)
- [Requirements](#-requirements)
- [Getting Started(Dev)](#-getting-starteddev)
- [Create migration](#-create-migration)

## ❯ 프로젝트 소개

- HoneyMoa는 블로그 혹은 채팅이라는 포맷에서 연인과의 꿀처럼 달콤한 추억을 모을 수 있는 서비스입니다.
- 연인과 커넥션을 맺어 블로그, 채팅방을 생성할 수 있습니다.
- 블로그는 원하는데로 배경 이미지를 커스텀할 수 있습니다.
- 블로그에 작성한 글은 비공개, 공개 여부를 선택하여 공개글 커뮤니티에서 추억을 공유할 수 있습니다.

### ❯ 개발 기간

2024.11.19 ~ ing

### ❯ 관련 Repository

[honey-moa-front](https://github.com/honey-moa/honey-moa-front)

### ❯ 서비스 사이트

[honeymoa.kr](https://honeymoa.kr)

### ❯ 팀원

<div align="left">

#### Backend

|                                                  **정비호**                                                  |                                                **박준혁**                                                 |
| :----------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: |
| [<img src="assets/team/hobijeong.jpeg" height=100 width=100> <br/> @hobiJeong](https://github.com/hobiJeong) | [<img src="assets/team/nicodora.jpeg" height=100 width=100> <br/> @Nicodora](https://github.com/Nicodora) |

#### Frontend

|                                            **이재진**                                            |                                                **박현우**                                                 |
| :----------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: |
| [<img src="assets/team/lee.jpeg" height=100 width=100> <br/> @zzzRYT](https://github.com/zzzRYT) | [<img src="assets/team/parkhyunwoo.png" height=100 width=100> <br/> @pho9902](https://github.com/pho9902) |

</div>

## ❯ Requirements

- Node.js 22.12.0
- Docker
- docker-compose

## ❯ Getting Started(Dev)

1. Clone repository

```bash
git clone https://github.com/honey-moa/honey-moa-server.git
```

2. Define the required env
3. npm install
4. Run `npm run start:db`
5. Run `npm run prisma:migrate:deploy` and `npm run prisma:generate`
6. Run `npm run build` and `npm run start` or `npm run start:dev`

## ❯ Create migration

1. Modify schema.prisma
2. Run `npm run prisma:migrate:preview` and check changes
3. Run `npm run prisma:migrate:deploy` for deploy
4. Apply changes by `npm run prisma:generate`
