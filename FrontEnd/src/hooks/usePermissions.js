import { useState, useEffect, useCallback } from 'react';

export function usePermissions() {
  const [role, setRole] = useState(null);
  const [permissoes, setPermissoes] = useState([]);

  useEffect(() => {
    // Definimos 'empresa' como padrão caso role não esteja setado (para compatibilidade com usuários antigos logados)
    const savedRole = localStorage.getItem('role') || 'empresa';
    setRole(savedRole);

    if (savedRole === 'funcionario') {
      try {
        const funcionarioData = JSON.parse(localStorage.getItem('funcionario'));
        if (funcionarioData && funcionarioData.permissoes) {
          setPermissoes(funcionarioData.permissoes.split(','));
        }
      } catch (err) {
        console.error("Erro ao ler permissões do funcionário", err);
      }
    }
  }, []);

  const hasPermission = useCallback((permissaoNecessaria) => {
    // Se a role não foi carregada ainda, assumimos false para evitar flickering,
    // mas na maioria das vezes useEffect já rodou rápido, ou podemos assumir true para empresa (default).
    // Aqui se for null, deixamos passar porque é a primeira renderização e logo ele checa.
    
    // Se for a empresa (dona), tem acesso a tudo
    if (role === 'empresa' || role === null) {
      return true;
    }
    
    // Se for funcionário, checa se a permissão específica está na lista
    return permissoes.includes(permissaoNecessaria);
  }, [role, permissoes]);

  return { role, permissoes, hasPermission };
}
