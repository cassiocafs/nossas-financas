# Validação de exclusão — categorias sem grupo (esteyceecassio@gmail.com)

Relatório somente de leitura, gerado a partir de `backend/prisma/validar-exclusao-categorias-sem-grupo.ts esteyceecassio@gmail.com`. Nenhuma categoria ou transação foi alterada.

## Resumo

- Categorias sem grupo: **127**
- Transações vinculadas (total): **9168**
- Itens de orçamento vinculados (total): **0**
- Regras de categorização vinculadas (total): **0**
- Com categoria equivalente (mesmo nome, com grupo) para reclassificar: **93/127**
- **Sem** equivalente — exclusão deixaria transações sem categoria: **34/127**

## ⚠️ Sem categoria equivalente (revisar antes de excluir)

Excluir estas categorias sem reclassificar manualmente deixará as transações vinculadas **sem categoria**.

| Categoria | ID | Transações | Itens orçamento | Regras |
|---|---|---:|---:|---:|
| Transferência | `db9fa9e0-99d7-46d5-921d-d837bdb1619c` | 1755 | 0 | 0 |
| RECEITA | `64d33f8a-6f32-4c69-80ab-bfd93b698ce8` | 187 | 0 | 0 |
| Educação | `ebc001b6-6794-494e-bc96-aee9fac1fa66` | 133 | 0 | 0 |
| VARIÁVEL | `3a59b4e0-c16a-4e56-ba90-a36fdaf61eee` | 115 | 0 | 0 |
| Fármacia (Filhos) | `0c768be7-da42-4f6b-be06-9980bcb81134` | 86 | 0 | 0 |
| Transp. Público | `89a61e66-6cfb-48c3-b546-3f6cace5d694` | 80 | 0 | 0 |
| Manut. SV MarAmor | `8bc020c2-9d9a-45ac-b8d1-10a8bc3b76ae` | 79 | 0 | 0 |
| VIAGEM | `acedb7f5-52e4-49d7-9b07-0ec680d3a21c` | 79 | 0 | 0 |
| Cachorras | `4c8f2d02-6aad-4224-968a-879db611213a` | 67 | 0 | 0 |
| Internet Denise | `bc4108ec-1d81-41e5-bcb4-051c65e1731b` | 65 | 0 | 0 |
| Inv. Cassio | `81525468-d004-4966-9920-fa06937af059` | 64 | 0 | 0 |
| Vestuário | `26778e59-4faa-4d8e-994b-ed5df3cb7a73` | 54 | 0 | 0 |
| AP SV Denise | `21cfc4b1-74d2-4ff4-bdfb-fe5a61380529` | 42 | 0 | 0 |
| Saúde | `8a825c19-c503-4d8d-99ce-d0e39a2c34cd` | 36 | 0 | 0 |
| AP SV Amoaras | `4427d334-0cd9-4cf6-af0a-5eb33af17e23` | 29 | 0 | 0 |
| Impostos | `7f7f60c3-665f-43f2-996f-39fc5de1471f` | 28 | 0 | 0 |
| Pós Cássio | `37824c47-3f0a-4816-918a-43ee187b8637` | 26 | 0 | 0 |
| Gás  Amoaras | `14d367e5-ff4a-4ad2-bca2-bc46941c2858` | 25 | 0 | 0 |
| IPTU  Amoaras | `e8ec301a-6d17-474e-9750-1a332c7e533a` | 24 | 0 | 0 |
| Luz  Amoaras | `76e17f71-9473-4f2e-94a5-2d4d59d6bd18` | 23 | 0 | 0 |
| LIS | `63413e4d-38e3-48a9-8380-92e2e3f4c4e2` | 20 | 0 | 0 |
| Celulares | `95a362c8-473f-4ba7-9ae8-b2707756816a` | 19 | 0 | 0 |
| Internet  Amoaras | `2da01579-1c6a-4102-a254-a7d486192279` | 19 | 0 | 0 |
| Seguro  Amoaras | `f203814d-29df-4928-9cd3-28bb89848101` | 19 | 0 | 0 |
| Salario Baba | `d4c7c3ca-b5e5-41e0-9533-9711d87cc512` | 14 | 0 | 0 |
| Apto Denise | `81440c43-c54f-4248-b558-52d0460c333c` | 12 | 0 | 0 |
| Estorno | `17022f62-154f-4808-be5e-26a0a6345dc5` | 9 | 0 | 0 |
| Queima diária | `00b731f1-dfe7-437e-b928-604c933e3d3a` | 8 | 0 | 0 |
| AP SV MarAmor | `18efe13a-379c-478d-bc75-f5692a7e47e2` | 5 | 0 | 0 |
| Estética (Filhos) | `07972168-a04f-4f7a-ad8f-e216ffc06fb2` | 4 | 0 | 0 |
| TV  Amoaras | `5e71cd6a-5791-4b3c-a903-1163ce6cccf3` | 3 | 0 | 0 |
| Assinaturas | `0a715e5d-01ba-407c-94fd-d679ae3748c1` | 2 | 0 | 0 |
| ECONOMIA | `1e197685-7dd5-480d-9409-b992fdbdb447` | 2 | 0 | 0 |
| Ed. Denise (Airbnb) | `689e34ff-2f0d-47e6-bcd9-82f5cc7a704d` | 1 | 0 | 0 |

## ✅ Com categoria equivalente (destino sugerido para reclassificação)

| Categoria (sem grupo) | ID origem | Transações | Grupo destino | Categoria destino (ID) |
|---|---|---:|---|---|
| Restaurante | `a0a1f661-cd5c-4567-986c-5c856ad6ee52` | 403 | VARIÁVEL | `41dcab55-8917-400e-86e0-8016aff6888c` |
| Mercado | `23647e5a-1024-420e-86d3-79ad686b0495` | 394 | FIXO | `60bce13c-52e9-4906-947b-2dfedb7c5911` |
| Material SV MarAmor | `4caa2c43-e377-4d78-9fe7-7bc4e6c36654` | 361 | VARIÁVEL | `56aa06a4-f46c-4586-a44d-5afc1dee24e0` |
| Presente | `3ab71579-ef91-40e9-8051-c95485feefd9` | 336 | VARIÁVEL | `52115608-b278-490d-8319-e73aa0f52942` |
| Lazer | `f2c8989e-00a0-4e30-b9ef-096fdc9c8f3c` | 305 | VARIÁVEL | `6b9678bf-b452-47e4-b04c-849b489f97bd` |
| Rend (Poup C&E) | `3d7a1731-3259-4248-8c23-fbe1ac711de1` | 274 | RECEITA | `dbcfc83b-af9b-4794-9e13-ac98a1b4e6dc` |
| Alimentação | `3056bb75-e075-42d3-a093-044318e3dc6b` | 266 | VIAGEM | `38e1ca11-b51f-4815-bcc0-936e3da5bfc9` |
| Farmácia | `d1e521cd-6e4a-40fc-b66a-8f9c21dbb837` | 196 | VARIÁVEL | `59a43fa9-93be-4267-9567-5e47494fa854` |
| Manut (Carro) | `97e20da5-eb62-4f73-a125-3da0071d3961` | 171 | VARIÁVEL | `80ee2400-e202-4a25-ab17-1a58b70e9c30` |
| Cel Esteyce | `7387c271-6f1a-4830-a5c7-4145cafe2903` | 146 | FIXO | `bb1047a0-c28b-4ba5-b0c3-0d7f28024b28` |
| Padaria | `d48e42ab-829c-4aa8-b111-783edae167c2` | 138 | FIXO | `143feb07-c675-4f36-8bdc-94eb36faf6ee` |
| Salário (Cássio) | `f645572d-cc87-4265-83de-92e167df34cd` | 138 | RECEITA | `2af6a4af-e17b-4a86-96b7-81a4511366e3` |
| Cel Cássio | `d33bdd69-d3a6-4c8a-b37b-c4be500ac417` | 134 | FIXO | `4679dc1f-a01b-43e2-9f83-49a1a7abd6a3` |
| Gasolina Moto | `031dfb89-a133-480b-bd31-090e34ee5684` | 133 | VARIÁVEL | `6344c22c-2e72-48a9-82e6-8ce6a29e1475` |
| Salário (Esteyce) | `b8bb6e16-1423-4c0d-a126-89ac3b1f06dc` | 117 | RECEITA | `42f3397b-3832-4f7b-aac9-b70a51451b1c` |
| Estética (Cássio) | `004f0a65-e3f2-4d13-b05b-dcc465e76172` | 113 | VARIÁVEL | `7039dada-e7cb-4737-b499-bac3c7419387` |
| Presente (Externo) | `90f204bd-743a-4dc7-9f50-b9d481d9e31b` | 104 | VARIÁVEL | `5fb165da-7336-4b6b-a787-127ae0faab26` |
| Manut (Moto) | `4f812551-cd1f-4ad2-9e9c-d32c9335bc00` | 98 | VARIÁVEL | `5896140c-c033-4af4-ba2b-9c9edd02a009` |
| Condomínio Denise | `7005e4ca-fede-4d9d-a6f6-7e3c39e82345` | 93 | FIXO | `8405ada9-77d2-4960-8254-6ba1710e82bb` |
| IPTU Denise | `56ce6c5e-240e-45f9-8916-fe6a5964e783` | 91 | FIXO | `39e537d5-296e-4fdb-9c24-311843e5ca69` |
| Luz Denise | `9dde4237-2d81-45b7-92fb-14ce51c34c22` | 91 | FIXO | `e2bd1d17-f1f1-4cba-b8d9-4ee5520b057f` |
| Ração | `ec038ea3-6833-42f0-a412-2824a04a6de3` | 80 | FIXO | `b24d32ba-37fb-45bf-a50b-970250dd759d` |
| Acessórios (Esteyce) | `dee01213-ee70-4760-b0e6-245a8441c790` | 79 | VARIÁVEL | `6fc7a867-1c23-4a65-b6be-9c74969536d5` |
| Roupas (Esteyce) | `d4173db9-5d7e-4a40-acd8-ef06c380a5df` | 79 | VARIÁVEL | `0bb854b8-4c09-4e59-974e-3777863b6ffb` |
| Seguro Carro | `4a871fec-55c9-4a3a-a69c-b6900af9978b` | 77 | VARIÁVEL | `99f427ac-31a9-48d6-bf73-fa49474c300d` |
| Pedágio | `0234f1ef-0c2c-479c-89ac-122a802eed73` | 69 | VARIÁVEL | `e616f1cc-eb00-4991-b1f5-7c757fdcfee8` |
| IOF | `064a224d-53c7-4829-83c7-3ba04cef46ff` | 67 | VARIÁVEL | `b21d79f4-2943-42ce-a4c0-4b10604272c6` |
| Papelaria | `54934d14-ed9d-4972-aec1-627d222501ff` | 62 | VARIÁVEL | `f71fa8f5-9249-47d7-822a-e2b5f15810bf` |
| IPVA+DPVAT+ Licen. (Carro) | `3f448cd7-9e71-4341-8e9e-969136fc1776` | 60 | VARIÁVEL | `e325899a-3a34-48b2-86b4-8a43a549e5a2` |
| Saúde Dogs | `839c5c44-e6f9-4596-bbc9-37cb9b92eec9` | 60 | FIXO | `ceb4343a-436f-42bc-961f-56cc194e68c1` |
| Feira | `c6e43fd8-d197-417c-a6ba-b64f48cdc9c1` | 58 | FIXO | `3dbc59b2-d2f7-41e2-9ffc-29914b03b7a9` |
| Netflix | `776cdee3-68d7-4333-918c-793b8f8bcf04` | 48 | VARIÁVEL | `851e313f-e2fe-476f-8f0f-bd8c1c14066d` |
| Transporte | `75c0a8bc-0a08-4c86-87db-dc82172138b9` | 48 | VIAGEM | `c9d8f8d6-c654-4abf-ac19-7a3954198d82` |
| Uber | `d851ea2b-7e6a-476f-a848-f978e0a7a1a2` | 47 | VARIÁVEL | `aa3ccd00-c4bb-41f4-88fd-9a08b2c8d45c` |
| Academia (Cássio) | `84db934a-4e8a-49af-9f12-5b9e5c29ae8f` | 45 | VARIÁVEL | `9b48f319-0c31-4fa7-9b13-2dc9d96f1863` |
| Presente (CEE) | `ebf58c41-36b4-4177-8bbb-bab2eb62d954` | 42 | VARIÁVEL | `5b030cc5-7bde-4d31-b7f7-0e01d06fe9b4` |
| Eletrodoméstico | `ab37cafa-b4c0-4442-bf4a-7f6c43c090b9` | 40 | VARIÁVEL | `533adbc7-2da0-477e-9665-68721d6bbdd6` |
| Gasolina Carro | `f572a3b0-66df-47a6-bf86-0fa291371b14` | 39 | VARIÁVEL | `7bfb09bd-0ba4-44df-a001-cbe8c237778a` |
| Limp SV Denise | `7505b26d-3c67-4abc-9301-84201fa192fa` | 39 | VARIÁVEL | `bd40292f-c61f-4abc-ad7d-8097e0b9b466` |
| Res. Carro | `567cd9cb-9034-469e-827c-e397c0fdd4d9` | 34 | ECONOMIA | `bb3711b4-46bf-4b46-b60e-1a00a95ec17c` |
| Roupas (Cássio) | `2a91ae3d-4e45-464d-bfa0-78c942297602` | 34 | VARIÁVEL | `8023f968-a6ae-4154-8fc4-61bf8b2ebba2` |
| Estacionamento | `4b2b3eee-5c1d-4996-916e-27470d8b96d7` | 33 | VARIÁVEL | `4228581e-7d42-4cc4-8284-5c981bb0c2c6` |
| Rend (Invest Esteyce) | `7a00dec6-7184-40e2-a726-11084278bc82` | 33 | RECEITA | `12770c6b-e7f0-419c-99aa-886f1e012004` |
| Hospedagem | `25b8f058-4a44-4642-9c96-f66424ca7ef5` | 32 | VIAGEM | `8012a509-1767-44f9-9844-3b6c67caaf01` |
| Rend (Invest Cássio) | `cc034cc7-8226-460e-8c95-67f267b393aa` | 32 | RECEITA | `646a16ee-5e1f-432b-9e9e-b1e2cc475ddb` |
| Internet | `d01475b5-2998-4363-bfee-be1a4e49449f` | 29 | FIXO | `016ba639-a9fd-4af9-9be2-a87ee9aac8fd` |
| IPVA+DPVAT+ Licen. (Moto) | `1510e914-7a0e-495d-a7d5-ca4c802e1900` | 29 | VARIÁVEL | `0e686b76-2fff-4da3-a364-4a2b62baf2e2` |
| Aluguel+Cond+IPTU | `459d1ea0-4ad2-41b8-b5e8-03cbb440c9c6` | 28 | FIXO | `4953ea57-8a48-4ceb-8423-e96f8e61da82` |
| Evento | `16fd22a2-a0a9-43e7-8062-10571ea21e53` | 27 | VARIÁVEL | `2e56083c-997d-46a5-8661-cc2dc6831ec8` |
| Refeição (Semanal) | `16c5240c-34e8-459a-a23c-015bd275d0c8` | 27 | FIXO | `e5b532f2-4678-4e7e-b28c-1ad4c0b6200d` |
| Luz | `9e76c0c7-424b-4711-ae1f-d24fb639484a` | 26 | FIXO | `2c41317d-6d3e-48fb-90ac-31ada6bc6ce9` |
| Gás | `0d473063-0586-42be-b8fe-c018b87e147d` | 25 | FIXO | `88bc1675-8eed-4232-9095-992c2e216c53` |
| Inglês (Cássio) | `97866099-3a89-4007-964d-7e52b4144fef` | 24 | VARIÁVEL | `5b2bc0f5-7a23-49ec-a7d1-1e6fb28f7168` |
| Inv. Esteyce | `7ded145a-dc76-4715-80be-7a16e3ddcd02` | 24 | ECONOMIA | `105d0e83-26ad-473d-8f54-3905e8274843` |
| Presente viagem (Externo) | `283b138d-ed7e-430f-8973-e8d458f0f44d` | 24 | VIAGEM | `ca82b287-f953-4b50-8b9a-5b66a67f163b` |
| Material SV Denise | `4c645ffe-06ac-436d-9101-58180b54c051` | 23 | VARIÁVEL | `3d86026c-c070-4a7c-842a-ce672c556e49` |
| Acessórios (Cássio) | `0648b3cc-c2c8-4a88-98b4-3b3f2b90d16b` | 22 | VARIÁVEL | `ca571b2f-39b6-4971-a01b-3550ee19a38a` |
| Açougue | `ba95810b-736b-4094-adc8-c56a92b47f21` | 22 | FIXO | `ef160ffe-34a2-4da7-87c1-4f34299e112c` |
| Bicicletas | `a5476057-a2ca-4172-b407-5651cfa272c0` | 22 | VARIÁVEL | `11413130-3f3c-429e-b4a5-31e2fce3c430` |
| Ingressos | `14d178d5-f4f7-4147-9da6-59df95e4f1dd` | 21 | VARIÁVEL | `3c012465-cac3-4039-88e7-30903e72be48` |
| Turismo | `f08cfc51-2e9d-4032-83f5-939b6805a06c` | 21 | VIAGEM | `89db9a5d-fbd6-4630-8dab-12441ff92805` |
| MBA | `8a8e523b-8050-4942-b2f5-b58c5aea839d` | 20 | VARIÁVEL | `79d0fece-772c-4640-962d-c51a85e63694` |
| Móveis | `1f86610c-ccbb-429a-83a7-a6157febbaba` | 20 | VARIÁVEL | `4d8df7e4-ca55-4f24-988d-5ffe43076a7c` |
| 13º Sal Cássio | `b4898f67-6a1f-487f-9e18-255db069b985` | 19 | RECEITA | `0b385ae1-38cd-444a-914c-f317c4ce3d73` |
| Calçados (Esteyce) | `65fa8b68-d207-473b-baf9-90461d4b2540` | 18 | VARIÁVEL | `92700bc9-84be-44f9-90f4-c8305e9c39ba` |
| (Antigo) Inscrições | `bcc9495a-45ac-4793-9a4b-6d4ea4456064` | 17 | VARIÁVEL | `bd5936f4-0ce9-45c5-af03-b8dcbf4bcd5b` |
| Estética (Esteyce) | `8f76fc51-508f-446e-b34e-00537e7d2c69` | 17 | VARIÁVEL | `ee5f08d0-881c-4e79-83d0-360c3faf077a` |
| Jornal | `90e235b8-b9a2-40e0-a770-0072c405084e` | 16 | FIXO | `0274e6eb-eafd-4988-81c0-141608232515` |
| Doações Realizadas | `ddea0a65-7790-43f2-b471-0064a2156f7c` | 15 | VARIÁVEL | `e2d228ec-6761-42a3-add5-8fc51b906fc0` |
| Manutenção SV Denise | `f553c239-5dd0-4de6-b104-318cfc61a549` | 15 | VARIÁVEL | `f0b8f9f5-c18c-462e-87f1-426aff4942bb` |
| Rend (Poup Apto Denise) | `050689c2-84d4-4a1a-b43d-6bc3f649b3ae` | 15 | RECEITA | `2aad3d0c-f789-47e8-9f72-1e4354a6f9e6` |
| Calçados (Cássio) | `6b9b2c69-2a1b-4b08-bac4-dc45935fe2c4` | 14 | VARIÁVEL | `2bc0eb44-0ba9-4e49-962f-981f05f164c1` |
| Limp SV Amoaras | `1bd5869f-b1da-4c84-bd05-464cae63c5b8` | 12 | VARIÁVEL | `7ae18dd3-e10b-4c93-bc58-8b364e7826ed` |
| Seguro Imóvel | `a14d1bab-b72d-46f1-837b-acb682b16a3b` | 12 | FIXO | `86c09ef1-7316-465e-b3ec-196dfcea170e` |
| Inglês (Esteyce) | `0b2e7a5e-ed1d-473e-91d5-97086facf194` | 11 | VARIÁVEL | `4d64d462-8415-48f1-958f-4175c66722be` |
| Res. Viagem | `1c75e127-70a3-4a50-9121-b0f360c94488` | 11 | ECONOMIA | `db2c5930-2ecb-450e-9f6d-e3f7f894e52b` |
| Airbnb Hospedagem | `48831139-3794-4ea5-ac5d-00dd8f70749e` | 10 | RECEITA | `9aaaaaa1-9c3e-4353-86f1-a16478c6f0c7` |
| DARF IF | `45ccf2a3-289a-432c-a4ef-ed4950a4377c` | 9 | VARIÁVEL | `b6d24375-49dd-489c-bc16-07cfd408b7d3` |
| Fundo de Reserva | `4aa67f75-6c1d-410a-8bea-65e64431d6bb` | 7 | ECONOMIA | `aa6c9e64-6e94-44c7-be6a-d2c95ca17199` |
| Multa (Carro) | `3eb7a1e9-a4bc-4f10-b608-3103d7211677` | 7 | VARIÁVEL | `16861c7c-a87d-4532-8958-08b02582955c` |
| Multa (Moto) | `fa9a0b8a-8e99-4249-ba2c-f0dfa139d0c9` | 6 | VARIÁVEL | `ece95fe2-3b5e-4230-b085-6714dcd0c7a7` |
| Doações Recebidas | `6edefb30-7912-4ad3-8688-1670d89217ae` | 5 | VARIÁVEL | `425b649f-8b2c-4399-bb82-ada421e47074` |
| Mercado SV Denise | `b4f0b68c-c999-4bf0-b26c-93b81512c827` | 5 | VARIÁVEL | `947387d1-efbf-4e5f-8f7e-862a6e189e34` |
| Rend (Nu Carro) | `2dc97895-ce03-4632-b4b6-b4a7ddcfbfbe` | 5 | RECEITA | `c4b0da22-74fe-46b9-a540-e4225b6e0ac3` |
| Médico | `cda065bf-db99-4c55-bf54-b0fdb9212d83` | 4 | VARIÁVEL | `8ae17c72-e94e-4f31-af58-8270defadab7` |
| Nota Fiscal Paulista | `38ee223d-7e63-4171-a686-1c548ce4c2c7` | 4 | RECEITA | `4e6f20ca-6ecd-462c-9c33-982dd7824245` |
| 13º Sal Esteyce | `165965ba-9fe1-4f92-b36b-eda167cf1337` | 3 | RECEITA | `b71e0766-5f17-48b0-8180-19415d32c009` |
| Adestramento | `83482487-c6d3-4c0e-a39b-2d4242809fed` | 2 | VARIÁVEL | `93f9c5ca-6677-4964-b7cc-ce1e7a7972ec` |
| Academia (Esteyce) | `5457139d-9352-40d8-a34d-e7750013e2a2` | 1 | VARIÁVEL | `163ecca9-6ab8-48c2-9f0c-275ad1e5f5d1` |
| Pet Sitter | `0146dfeb-db6d-4a48-80c7-fb4d20aadf09` | 1 | VIAGEM | `6089b18a-1929-4ac9-9075-a07b04ca82bc` |
| Aluguel Denise | `316e4a45-0b29-4b56-829f-c08232a2f502` | 0 | ECONOMIA | `641941e2-d89e-4fe7-9976-6a6428eb124c` |
| Benefício Cássio | `31868203-85ad-4450-83b3-41a413963851` | 0 | RECEITA | `0c865312-84df-4048-b09a-d86fd0f0338d` |
| TV | `3fd9f839-820a-49ec-ace5-62e237bbba7f` | 0 | FIXO | `42485803-e156-47f9-a2a1-095945239bca` |

