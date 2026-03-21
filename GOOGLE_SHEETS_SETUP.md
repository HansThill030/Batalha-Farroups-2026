# Como conectar o placar ao Google Sheets

## 1. Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha
2. Renomeie a aba para **Placar**
3. Adicione os cabeçalhos na linha 1:
   - A1: `Nome`
   - B1: `Cor`
   - C1: `Pontos`
4. Preencha os dados das equipes a partir da linha 2:
   ```
   Equipe Ouro   | #fbbf24 | 4200
   Equipe Prata  | #d1d5db | 3850
   Equipe Bronze | #cd7f32 | 3300
   ```
5. Clique em **Compartilhar** → "Qualquer pessoa com o link" → **Visualizador**

## 2. Pegar o ID da planilha

A URL da sua planilha tem esse formato:
```
https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit
```
Copie o ID (entre `/d/` e `/edit`).

## 3. Criar a API Key do Google

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto ou use um existente
3. Vá em **APIs & Serviços** → **Biblioteca**
4. Busque e ative **Google Sheets API**
5. Vá em **APIs & Serviços** → **Credenciais** → **Criar credenciais** → **Chave de API**
6. Copie a chave gerada
7. (Recomendado) Restrinja a chave para a Sheets API e seu domínio

## 4. Configurar no Vercel

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:
```
GOOGLE_SHEET_ID = seu_id_da_planilha
GOOGLE_API_KEY = sua_api_key
NEXT_PUBLIC_GOOGLE_API_KEY = sua_api_key
NEXT_PUBLIC_BASE_URL = https://seu-site.vercel.app
```

## 5. Usar na área do professor

Na aba **Placar** da área do professor, cole o ID da planilha no campo e clique em **Importar**. O site vai buscar os dados direto da planilha!

Para atualizar o placar: edite a planilha no Google Sheets e clique em Importar novamente.
