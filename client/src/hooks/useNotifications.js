/**
 * Padrão Observer para notificações do UniTreino.
 * NotificationService age como o "Subject" (Publisher).
 * Qualquer componente que chamar useNotifications() torna-se um "Observer".
 */
import { useState, useEffect } from 'react';

// singleton
const NotificationService = (() => {
  let observers = [];
  let state = {
    notifications: [],
  };

  return {
    // registra um observer (componente React via setState)
    subscribe(observer) {
      observers.push(observer);
    },

    // remove o observer quando o componente desmonta
    unsubscribe(observer) {
      observers = observers.filter((o) => o !== observer);
    },

    // notifica todos obs. com o estado atual
    notify() {
      observers.forEach((observer) => observer({ ...state }));
    },

    // add notificação e notifica a todos
    push(notification) {
      const nova = {
        id: Date.now(),
        titulo: notification.titulo,
        mensagem: notification.mensagem,
        tipo: notification.tipo || 'info',
        lida: false,
        data_envio: new Date().toISOString(),
      };
      state = { notifications: [nova, ...state.notifications] };
      this.notify();
    },

    markAsRead(id) {
      state = {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        ),
      };
      this.notify();
    },

    markAllAsRead() {
      state = {
        notifications: state.notifications.map((n) => ({ ...n, lida: true })),
      };
      this.notify();
    },

    getState() {
      return state;
    },
  };
})();

// observer
export function useNotifications() {
  const [state, setState] = useState(NotificationService.getState());

  useEffect(() => {
    // registra comp. como observer
    NotificationService.subscribe(setState);

    return () => {
      NotificationService.unsubscribe(setState);
    };
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.lida).length;

  return {
    notifications: state.notifications,
    unreadCount,
    markAsRead: (id) => NotificationService.markAsRead(id),
    markAllAsRead: () => NotificationService.markAllAsRead(),
    push: (n) => NotificationService.push(n),
  };
}

export { NotificationService };
