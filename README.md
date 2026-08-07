# 🍳 Sistema KDS Cozinha (Integração Goomer + Nuvem 24/7)

Sistema de Exibição de Cozinha (Kitchen Display System) moderno em tempo real, integrado com o **Goomer (Goomer Go / Na Mesa / Delivery)** e pronto para rodar **100% online na nuvem 24 horas por dia** sem depender do seu notebook ligado.

---

## ⚡ Recursos Principais
- 🔔 **Alertas Sonoros Instantâneos**: Som sintetizado via Web Audio API em novos pedidos.
- ⏱️ **Temporizadores Dinâmicos de Cozinha**: Contagem de tempo decorrido com alerta Amarelo (10 min) e alerta Vermelho pulsante (20 min).
- 🏷️ **Cards de Pedidos com Destaques**: Visualização clara de mesa, comanda, cliente, quantidade de itens e observações ("Sem cebola", "Sem Wasabi").
- 🍳 **Filtros por Setor**: Cozinha Hot, Sushibar, Bar & Drinks e Sobremesas.
- ⚡ **Sincronização em Tempo Real (Supabase Realtime)**: Atualiza todas as TVs/Tablets da cozinha em milissegundos.
- 🧪 **Simulador de Webhooks Goomer Integrado**: Teste a entrada de pedidos com 1 clique direto na tela.
- 🖥️ **Modo TV / Tela Cheia (Fullscreen)**: Ideal para monitores da cozinha e smart TVs.

---

## ☁️ Guia: Como colocar Online 24/7 (Sem Depender do Notebook)

### Passo 1: Criar o Banco de Dados Gratuito no Supabase (2 minutos)
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **"New Project"**, defina um nome (ex: `kds-cozinha`) e uma senha.
3. No painel do Supabase, vá em **SQL Editor** no menu esquerdo.
4. Abra o arquivo `supabase_schema.sql` deste projeto, copie todo o conteúdo, cole no SQL Editor e clique em **Run**.
5. Em **Project Settings ➔ API**, copie a `URL` e a chave `anon public`.

---

### Passo 2: Hospedar o KDS na Vercel (3 minutos)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Suba este projeto para o seu GitHub e conecte a Vercel.
3. Nas **Environment Variables** da Vercel, adicione:
   - `VITE_SUPABASE_URL` = (sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon do Supabase)
4. Clique em **Deploy**. Sua aplicação estará no ar 24h por dia num link tipo: `https://meu-kds-cozinha.vercel.app`.

---

### Passo 3: Cadastrar o Webhook no Painel Goomer (1 minuto)
1. No seu painel da Vercel, sua URL de webhook será:
   `https://meu-kds-cozinha.vercel.app/api/goomer-webhook`
2. Acesse o painel do **Goomer ➔ Configurações ➔ API / Webhooks / Integrações**.
3. Cole a URL acima no campo de Webhook de novos pedidos.
4. Pronto! Sempre que um cliente fizer pedido no tablet, QR Code ou Delivery do Goomer, ele aparecerá instantaneamente com som na tela da cozinha! 🚀

---

## 🛠️ Executando Localmente para Testes

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
