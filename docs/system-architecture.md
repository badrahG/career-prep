# CareerPrep System Architecture

## Diagram Title

CareerPrep системийн давхаргат архитектурын ерөнхий зураглал

## Recommended Figure Caption

Зураг X.X. CareerPrep платформын системийн архитектур, үндсэн модулиуд болон өгөгдлийн урсгал

## Short Description For Thesis

CareerPrep платформ нь давхаргат архитектуртай веб систем бөгөөд хэрэглэгчийн интерфейс, бизнес логик, өгөгдөл хадгалах давхаргууд хоорондоо тодорхой үүргээр тусгаарлагдсан. Frontend талд React болон Vite ашиглан хэрэглэгчийн интерфейс, route удирдлага, authentication state болон API холболтыг хэрэгжүүлсэн. Backend талд FastAPI ашиглан REST API, middleware хамгаалалт, бизнес үйлчилгээ, router бүтэц болон өгөгдлийн сангийн хандалтыг зохион байгуулсан. Persistence давхаргад SQLAlchemy ORM, Pydantic schema, Alembic migration ашиглагдаж, PostgreSQL өгөгдлийн сантай холбогддог. Мөн SMTP үйлчилгээ ашиглан и-мэйл баталгаажуулалт, нууц үг сэргээх болон тэтгэлгийн хугацааны сануулга илгээх боломжтой.

## How To View

1. [system-architecture.mmd](/C:/career-platform/docs/system-architecture.mmd)-ийг Mermaid Live Editor дээр paste хийж шууд зураг болгож болно.
2. GitHub, Markdown editor, эсвэл Mermaid дэмждэг diagram tool дээр нээгээд SVG эсвэл PNG болгон export хийж болно.
3. Дипломын тайланд SVG форматаар export хийвэл хамгийн цэвэр, мэргэжлийн харагдана.

## Current Layout Style

Одоогийн диаграмм нь таны жишээ зурагтай төстэй байдлаар дараах бүтэцтэй:

- Зүүн талд `Frontend`
- Дунд хэсэгт `Middleware + REST API`
- Баруун дотор хэсэгт `Routers / Controllers`
- Түүний хажууд `Services`
- Хамгийн баруун талд `Database / Storage`

Ингэснээр системийн давхарга болон өгөгдлийн урсгал илүү академик, тайлангийн хэв маягтай харагдана.

## Suggested Tools

- Mermaid Live Editor
- diagrams.net
- VS Code Mermaid preview extension

## Notes

- Хэрэв хүсвэл үүний дараагийн алхамд би `deployment architecture` болон `use case architecture` гэсэн тусдаа 2 зураг нэмж өгч болно.
- Мөн энэ диаграммыг танай сургуулийн тайлангийн стандартын өнгө, гарчиг, дугаарлалттай болгож дахин цэвэрлэж өгч болно.
