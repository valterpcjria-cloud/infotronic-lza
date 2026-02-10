# Release Notes - v1.0.57 (Latest)

Ajuste de visibilidade: usuários criados por Admins agora aparecem mesmo sem a migração do banco.

## 🚀 Novidades e Correções

### 🛡️ Gestão de Usuários
- **Visibilidade Admin:** Corrigido problema onde Admins não viam os usuários que acabaram de criar caso a coluna de rastreamento (`created_by`) ainda não tivesse sido adicionada ao banco de dados.
- **Sincronização de Dados:** Garantia de que a lista de usuários seja populada corretamente para todos os níveis de acesso.

---
**Status:** ✅ Estável | **Versão:** 1.0.57 | **Data:** 10/02/2026

# Release Notes - v1.0.56 (Stable)

Melhoria na resiliência do sistema: detecção automática de colunas faltantes e validação de configuração.

## 🚀 Novidades e Correções

### 🛡️ Autodiagnóstico e Segurança
- **Coluna Faltante:** Agora o sistema detecta se a coluna `created_by` existe no banco. Se não existir, ele ignora a restrição e permite a criação/listagem normalmente (sem erro 500), dando tempo para o usuário aplicar o SQL.
- **Checagem de Senha:** Adicionado um aviso claro caso o arquivo `api.php` seja enviado sem a senha do banco de dados configurada.
- **Detecção de Duplicados:** Agora o sistema avisa explicitamente se você tentar criar um usuário com login que já existe.
- **JSON Garantido:** Reforçada a limpeza de saída para evitar que avisos do PHP corrompam a resposta enviada ao frontend.

---
**Status:** ✅ Estável | **Versão:** 1.0.56 | **Data:** 10/02/2026

# Release Notes - v1.0.55 (Stable)

Correção crítica na criação de usuários em servidores sem suporte nativo a headers avançados.

## 🚀 Novidades e Correções

### 🛡️ Estabilidade e Compatibilidade
- **Compatibilidade PHP:** Implementado fallback para `getallheaders()`, permitindo que o sistema funcione em servidores Nginx e FastCGI.
- **Melhoria nos Headers:** Sistema agora busca requesters via cabeçalhos nativos do servidor como fallback.
- **Tratamento de Erros:** Atualizado sistema de logs para capturar falhas críticas do PHP (Throwable), fornecendo diagnósticos mais claros no painel.

---
**Status:** ✅ Estável | **Versão:** 1.0.55 | **Data:** 10/02/2026

# Release Notes - v1.0.54 (Stable)

Restrição de permissões para Admins: agora eles gerenciam apenas quem criaram.

## 🚀 Novidades

### 🛡️ Gestão de Segurança e Permissões
- **Hierarquia de Criação:** Admins agora podem gerenciar (ver/editar/excluir) apenas os usuários que eles mesmos criaram.
- **Proteção SuperAdmin:** Usuários SuperAdmin ficam invisíveis e protegidos contra qualquer ação de usuários de nível Admin.
- **Rastreamento de Origem:** Implementado sistema de `created_by` no banco de dados para auditar quem criou cada conta.
- **Prevenção de Promoção:** Admins não podem criar ou promover outros usuários ao nível de SuperAdmin.

---
**Status:** ✅ Estável | **Versão:** 1.0.54 | **Data:** 10/02/2026

# Release Notes - v1.0.53 (Stable)

Implementação do recurso de Ativar/Desativar contas de usuários.

## 🚀 Novidades

### 🛡️ Gestão de Segurança
- **Status de Ativação:** SuperAdmins agora podem ativar ou desativar contas de usuários através de um toggle (chave) no painel.
- **Bloqueio de Login:** Usuários com contas desativadas são impedidos de realizar login no sistema até que sejam reativados.
- **Indicadores Visuais:** Adicionado status (ATIVO/INATIVO) na lista de usuários para rápida identificação.

---
**Status:** ✅ Estável | **Versão:** 1.0.53 | **Data:** 10/02/2026

# Release Notes - v1.0.52 (Stable)

Melhorias na experiência do usuário (UX) e acesso completo para Colaboradores.

## 🚀 Novidades

### 🛠️ Interface do CMS
- **Botões "Novo":** Adicionados botões de atalho **"Novo Produto"** e **"Nova Categoria"** diretamente nas listagens.
- **Fluxo de Trabalho:** Agora Colaboradores podem criar novos itens com um único clique, além de editar e excluir os existentes.

---
**Status:** ✅ Estável | **Versão:** 1.0.52 | **Data:** 10/02/2026

# Release Notes - v1.0.51 (Stable)

Adição da função "Colaborador" com permissões limitadas para gestão operacional.

## 🚀 Novidades

### 🛡️ Gestão de Usuários
- **Nova Função "Colaborador":** Usuários com este nível têm acesso apenas a **Produtos** e **Categorias**.
- **Restrição de Acesso:** Abas de "Configurações" e "Usuários" ocultas para Colaboradores para maior segurança.
- **Interface de Cadastro:** Atualizado o formulário de usuários para suportar a nova função.

---
**Status:** ✅ Estável | **Versão:** 1.0.51 | **Data:** 10/02/2026

# Release Notes - v1.0.50 (Stable)

Novo Módulo de Gestão de Usuários com controle de acesso para SuperAdmins.

## 🚀 Novidades

### 🛡️ Gestão de Usuários
- **Níveis de Acesso (RBAC):** Introdução das funções `superadmin` e `admin`.
- **Painel de Usuários:** Nova interface no CMS para gerenciar administradores (exclusivo SuperAdmin).
- **Segurança Backend:** Endpoints da API agora protegidos por verificação de função.

---
**Status:** ✅ Estável | **Versão:** 1.0.50 | **Data:** 10/02/2026

# Release Notes - v1.0.49 (Stable)

Margens mínimas no logo mobile + confirmação de ícones sociais no rodapé.

## 🚀 Novidades

### 📱 Header Mobile
- **Margens Mínimas:** Padding reduzido de py-2 para py-1 (4px superior/inferior).

### 🔗 Rodapé
- **Ícones Sociais:** Facebook e Instagram já estão implementados e aparecerão quando os links forem configurados no Painel CMS > Configurações.

---
**Status:** ✅ Estável | **Versão:** 1.0.49 | **Data:** 06/02/2026

# Release Notes - v1.0.48 (Stable)

Logo mobile triplicada + margens reduzidas para visual mais compacto.

## 🚀 Novidades

### 📱 Logo Mobile
- **Tamanho 3x:** Logo mobile agora com 192px (h-48).
- **Margens Compactas:** Padding vertical reduzido de 16px para 8px.

---
**Status:** ✅ Estável | **Versão:** 1.0.48 | **Data:** 06/02/2026

# Release Notes - v1.0.47 (Stable)

Ajuste fino: logo mobile aumentada 1.5x para maior impacto visual.

## 🚀 Novidades

### 📱 Logo Mobile
- **Tamanho Ampliado:** Logo mobile de 64px para 96px (dobro e meio).
- **Padding Ajustado:** Mais espaço vertical para a logo respirar.

---
**Status:** ✅ Estável | **Versão:** 1.0.47 | **Data:** 06/02/2026

# Release Notes - v1.0.46 (Stable)

Novo layout mobile do cabeçalho: logo centralizada + busca visível.

## 🚀 Novidades

### 📱 Header Mobile Reformulado
- **Logo Centralizada:** Logo aparece sozinha na primeira linha, maior e centralizada (64px).
- **Busca no Mobile:** Campo de busca agora visível no celular, na segunda linha do header.
- **Ações Compactas:** Botões de CMS e Orçamento lado a lado com a busca.
- **Desktop Inalterado:** Layout de desktop permanece exatamente como antes.

---
**Status:** ✅ Estável | **Versão:** 1.0.46 | **Data:** 06/02/2026

# Release Notes - v1.0.45 (Stable)

Correção de proporção da logo no mobile para um visual mais equilibrado.

## 🚀 Novidades

### 📱 Interface Mobile
- **Logo Redimensionada:** Reduzida a altura da logo no mobile de 72px para 48px, garantindo um visual mais elegante e sem poluição visual.
- **Header Compacto:** Altura do cabeçalho ajustada de 112px para 80px no mobile, liberando mais espaço para o conteúdo.
- **Sincronização Perfeita:** Barra de categorias agora fixa em `top-20` para acompanhar o novo layout móvel.

---
**Status:** ✅ Estável | **Versão:** 1.0.45 | **Data:** 06/02/2026

# Release Notes - v1.0.44 (Stable)

Ajustes finais de layout mobile, sincronização de navegação e limpeza de mídias sociais.

## 🚀 Novidades

### 📱 Interface & UX
- **Sincronização de Scroll:** Corrigida a posição da barra de categorias no tablet (`sm`), agora perfeitamente alinhada com o cabeçalho de `h-32`.
- **Logo Monumental:** Refinado o tamanho da logo em resoluções intermediárias para garantir visibilidade máxima.
- **Simplificação de Redes:** Rodapé e CMS agora exibem exclusivamente Facebook e Instagram, focando no que é essencial.

### 🛠️ Estabilidade
- **Feedback de Login:** Melhoradas as mensagens de erro no acesso ao painel para facilitar diagnóstico de conexão.

---
**Status:** ✅ Estável | **Versão:** 1.0.44 | **Data:** 06/02/2026

# Release Notes - v1.0.43 (Stable)

Melhoria adicional na visibilidade mobile: logo ampliada no cabeçalho mantendo a funcionalidade.

## 🚀 Novidades

### 📱 Interface Mobile (UX)
- **Logo Ultra-Visible (Mobile):** Aumentamos a altura da logo no mobile para `h-18`, garantindo que a marca seja lida com clareza sem interferir nos botões.
- **Espaçamento Otimizado:** Ajustada a altura do cabeçalho mobile para `h-28` para acomodar a nova logo com folga e elegância.
- **Sincronização Final:** Barra de categorias agora fixa em `top-28` para acompanhar o novo layout.

---
**Status:** ✅ Estável | **Versão:** 1.0.43 | **Data:** 06/02/2026

# Release Notes - v1.0.42 (Stable)


Correção crítica da visualização mobile: botões de ação restaurados e layout otimizado.

## 🚀 Novidades

### 📱 Experiência Mobile (UX)
- **Layout em Linha:** Mudamos o cabeçalho mobile para um layout horizontal, garantindo que a logo gigante não empurre os botões para fora da tela.
- **Botões Restaurados:** Corrigida a visibilidade do botão de Painel CMS e Meu Orçamento em dispositivos móveis.
- **Sincronização de Scroll:** Ajustada a posição fixa da barra de categorias para a nova altura otimizada do cabeçalho mobile (`h-24`).

---
**Status:** ✅ Estável | **Versão:** 1.0.42 | **Data:** 06/02/2026

# Release Notes - v1.0.41 (Stable)


Upgrade colossal da logomarca: branding triplicado e visibilidade máxima no topo do site.

## 🚀 Novidades

### 🎨 Design & Impacto
- **Logo Mega-Size:** Triplicamos o tamanho da logo no cabeçalho conforme solicitado, tornando a marca impossível de ignorar.
- **Cabeçalho Reestruturado:** Ajustamos a altura do cabeçalho para `h-48` no desktop para acomodar a nova escala da marca com sofisticação.
- **Sincronização de Layout:** Atualizamos a posição fixa das categorias para manter a navegação perfeita com o novo cabeçalho.

---
**Status:** ✅ Estável | **Versão:** 1.0.41 | **Data:** 06/02/2026

# Release Notes - v1.0.40 (Stable)


Otimização máxima da logomarca: agora com visibilidade total e destaque premium.

## 🚀 Novidades

### 🎨 Branding & UX
- **Visibilidade Extrema:** Aumentamos significativamente o tamanho da logo no Cabeçalho e Rodapé para garantir que a marca seja o centro das atenções.
- **Ajuste de Proporção:** Otimizamos o container da logo para evitar que ela pareça pequena em qualquer dispositivo.

---
**Status:** ✅ Estável | **Versão:** 1.0.40 | **Data:** 06/02/2026

# Release Notes - v1.0.39 (Stable)


Atualização da identidade visual: nova logomarca oficial implementada.

## 🚀 Novidades

### 🎨 Design & Branding
- **Nova Logomarca:** Substituída a logo temporária pela logomarca oficial da Infotronic.
- **Visibilidade:** Dimensões do cabeçalho e rodapé aumentadas para destacar a nova identidade visual.

---
**Status:** ✅ Estável | **Versão:** 1.0.39 | **Data:** 06/02/2026

# Release Notes - v1.0.38 (Stable)


Melhorias significativas de responsividade e design mobile.

## 🚀 Novidades

### 📱 Experiência Mobile
- **Hero Section:** Título principal ajustado para telas pequenas, garantindo harmonia visual.
- **Barra de Categorias:** Otimizada para scroll horizontal suave e ícones compactos em dispositivos móveis.
- **Rodapé:** Layout totalmente responsivo com alinhamento centralizado e espaçamento balanceado no mobile.
- **Grid de Produtos:** Ajuste de densidade e tipografia para melhor leitura em smartphones.

---
**Status:** ✅ Estável | **Versão:** 1.0.38 | **Data:** 06/02/2026

# Release Notes - v1.0.37 (Stable)


Limpeza de mídias sociais: removidos LinkedIn e YouTube para simplificação.

## 🚀 Novidades

### 📱 Rodapé & CMS
- **Simplificação:** Removidos ícones e campos de LinkedIn e YouTube, mantendo foco em Facebook e Instagram conforme solicitado.

---
**Status:** ✅ Estável | **Versão:** 1.0.37 | **Data:** 06/02/2026

# Release Notes - v1.0.36 (Stable)


Esta versão traz o botão de Logout no Painel e correções de segurança no carregamento de dados.

## 🚀 Novidades

### 🚪 Painel de Controle
- **Logout:** Botão "Finalizar Sessão" adicionado para sair do painel com segurança.

### 🛡️ Estabilidade
- **Fallback de Conteúdo:** Garantia de que a página nunca fique em branco, restaurando dados iniciais se o banco estiver vazio.

---
**Status:** ✅ Estável | **Versão:** 1.0.36 | **Data:** 06/02/2026

# Release Notes - v1.0.35 (Stable)


Esta versão restaura os ícones originais do rodapé e garante que os dados reais do banco sejam priorizados.

## 🚀 Novidades

### 📱 Mídias Sociais
- **4 Redes Sociais:** Adicionado suporte para LinkedIn e YouTube (FB, IG, IN, YT).
- **Rodapé Restaurado:** Ícones agora são sempre visíveis (como no mockup original) e vinculados dinamicamente.
- **CMS Expandido:** Painel agora permite configurar os 4 links sociais.

### 💾 Dados Reais
- **Prioridade 100%:** Dados mockups removidos quando o banco de dados está disponível.

---
**Status:** ✅ Estável | **Versão:** 1.0.35 | **Data:** 06/02/2026

# Release Notes - v1.0.34 (Stable)


Esta versão foca na integração com mídias sociais e melhorias no Painel de Controle, permitindo uma gestão completa dos atalhos do Instagram e Facebook.

## 🚀 Novidades

### 📱 Mídias Sociais
- **CRUD de Redes Sociais:** Agora é possível configurar os links oficiais de Instagram e Facebook diretamente na aba de Configurações do Painel CMS.
- **Ícones Dinâmicos:** O rodapé agora exibe os ícones oficiais das redes sociais apenas quando um link está configurado, garantindo uma interface limpa.
- **Redirecionamento Inteligente:** Atalhos configurados abrem em novas abas, mantendo o usuário engajado no site.

### 🛠️ Ajustes no CMS
- **Novos Campos de Dados:** Interface de configurações expandida para suportar URLs de redes sociais com ícones ilustrativos.
- **Tipagem Segura:** Atualização do core do sistema para suportar os novos metadados de mídias.

---
**Status:** ✅ Estável | **Versão:** 1.0.34 | **Data:** 06/02/2026

# Release Notes - v1.0.33 (Stable)


Esta é a primeira versão considerada **ESTÁVEL** do Sistema Infotronic, consolidando diversas melhorias de UI/UX, correções de banco de dados e refinamentos no fluxo de gerenciamento de produtos.

## 🚀 Principais Melhorias

### 🛠️ CMS & Dashboard
- **Layout 50/50:** A visualização de produtos agora é dividida igualmente entre a lista e o editor, proporcionando um ambiente de trabalho mais equilibrado.
- **Limpeza da Hero:** Removidas informações de estatísticas (+15 anos, Suporte 24/7) do banner principal para um visual mais limpo e moderno.
- **UX de Preços:** Adicionado o prefixo **`R$`** fixo no campo de valor, facilitando a identificação visual e evitando erros de preenchimento.
- **Espaçamento Refinado:** Ajuste de margens em toda a interface do CMS, garantindo que menus e filtros não fiquem sobrepostos aos componentes de dados.
- **Botão de Edição:** Correção na confiabilidade do clique nas ações da tabela, garantindo abertura imediata do formulário.

### 📦 Modal de Produto (Front-end)
- **UI Reestruturada:** As especificações técnicas e o botão de orçamento foram integrados à coluna principal de informações.
- **Fim das Sobreposições:** O layout foi corrigido para que o botão de fechar (X) nunca sobreponha o conteúdo ou botões de ação, independentemente do tamanho da tela.

### ⚙️ Configurações & Backend
- **Correção Salvar Dados:** Resolvido erro de SQL (`Invalid parameter number`) que impedia a gravação das configurações gerais.
- **Logs Inteligentes:** O sistema agora reporta erros detalhados do banco de dados diretamente no CMS, facilitando diagnósticos rápidos.
- **WhatsApp Padrão:** Atualizado o número global de orçamentos para `556136226419`.

## 💎 IA & Inteligência
- **Integração Gemini:** Geração automática de descrições comerciais para equipamentos, otimizando o tempo de cadastro.

---
**Status:** ✅ Estável | **Versão:** 1.0.33 | **Data:** 05/02/2026
