# Branch Strategy

**GitHub issue를 생성하면 자동으로 label과 title에 맞춰 브랜치가 생성됨.**

## Example

**feat/#10/create_post_api**

### 작업 타입

|   Type   |     Description     |         Example         |
| :------: | :-----------------: | :---------------------: |
|  deploy  |   배포 관련 작업    |       배포 자동화       |
|   auto   |     자동화 작업     |     swagger 자동화      |
|  setup   |   세팅 관련 작업    |      typeorm setup      |
|   doc    |      문서 작업      |       README 수정       |
|    db    |     DB관련 작업     |        migration        |
|  bugfix  |   버그 수정 작업    |      500에러 수정       |
|   feat   |      기능 추가      |    로그인 기능 추가     |
|  modify  |   기능 수정 작업    |    로그인 기능 수정     |
| refactor |    단순 리펙토링    |      prettier 적용      |
|  delete  | 단순 코드 삭제 작업 | 사용하지 않는 코드 삭제 |
|   test   |   테스트코드 작업   | 로그인 테스트코드 추가  |

## Git-Flow

### main

- 상용 환경 서버에 배포되는 branch
- 기능 개발 혹은 수정 및 테스트가 완료된 기능들을 관리

### develop

- 개발한 기능들이 개발 환경 서버에 배포되는 branch
- 각 `feature branch`에서 개발한 기능들을 `develop branch`에 merge한다
  - 개발 환경 서버에 배포된 기능들을 테스트하고 버그 수정 및 배포 가능한 상태가 되면 `main branch`에 merge

### feature

- 기능을 개발하는 branch
- 새로운 기능 개발 및 수정이 필요할 때마다 `develop branch`에서 분기함.
- 작업이 완료되면 변경 사항들을 `develop branch`에 merge한다.
