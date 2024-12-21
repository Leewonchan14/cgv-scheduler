# CGV 근무표 자동화 프로젝트

📖 프로젝트 소개

https://cgv-scheduler.vercel.app/

이 프로젝트는 CGV 주안점에서 매니저F로 근무하는 인원의 주요 업무 중 하나인 근무표 작성 작업을 자동화하여 효율성을 높이고자 기획되었습니다.

많은 조건과 제약사항을 고려하여 매니저의 업무 부담을 줄이고, 근무자들에게 공정한 근무 배정을 제공하는 데 목적을 두고 있습니다.

**🚀 주요 기능**

1. **근무자 관리**
    근무자 추가, 삭제, 수정 가능.
    근무자의 근로계약서를 기반으로 가능한 요일 및 시간 저장.
    ![image](https://github.com/user-attachments/assets/02add07f-fcf0-40e0-b29a-65d92ffb30bb)

2. **근무 일정 관리**
    근무표를 주 단위로 편집 및 수정 가능.
    근무자의 출근 횟수 및 근무시간 확인 가능.
    ![dlfwjdrhksfl](https://github.com/user-attachments/assets/78caaf7a-85bf-4975-b15a-5fd96234b62f)

3. **자동 근무표 작성**
    조건을 만족하는 근무자를 근무표에 자동 배치.
    백트래킹 알고리즘을 통해 근무자를 배치하며 가능한 근무자를 필터링.
    ![화면 기록 2024-12-22 오전 12 16 02](https://github.com/user-attachments/assets/cea2fab8-36ef-41bb-8bea-e14d41fd5b8f)

4. **근무자 투입 가능 여부 표시**
    특정 근무에 투입 가능한 인원과 불가능한 인원을 시각적으로 구분.

## **💡 고려된 조건 (도메인)**

1. 하루에 한 번만 근무 가능.
2. 각 근무자는 요일별로 가능한 포지션이 다름.

    **포지션**: 매점, 플로어, 멀티.

3. 근로계약서에 명시된 요일 및 시간만 근무 가능.
4. 각 근무자의 주당 최소/최대 출근 횟수를 준수.
5. 개인 사정으로 특정 요일 근무 불가 시 반영.
6. 전날 마감 근무 시 다음날 오픈 근무 불가.
7. 최대 연속 근무일 준수 (예: 최대 4일 연속 근무 금지).
8. 멀티 포지션 인원의 최소 투입 요건 충족.

**🛠️ 사용 기술**

**Frontend**: <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"> <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">

**Backend**: <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">  <img src="https://img.shields.io/badge/typeorm-FE0803?style=for-the-badge&logo=typeorm&logoColor=white"> <img src="https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">

**Utilities**:

- **State Management**: <img src="https://img.shields.io/badge/reactquery-FF4154?style=for-the-badge&logo=reactquery&logoColor=white">

- **Validation**: <img src="https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white">

- **Testing**: <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white">

- **Deployment**: <img src="https://img.shields.io/badge/vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
