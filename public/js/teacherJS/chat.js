document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const form = document.querySelector('#form');
    const nameInput = document.querySelector('#name');
    const surnameInput = document.querySelector('#surname');
    const messageInput = document.querySelector('#input');
    const messages = document.querySelector('#messages');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const surname = surnameInput.value.trim();
      const msg = messageInput.value.trim();
      if (msg) {
        socket.emit('chatMessage', { name, surname, text: msg });
        messageInput.value = '';
      }
    });

    socket.on('chatMessage', (msg) => {
      const item = document.createElement('li');
      item.classList.add('p-2');
      item.textContent = `[${msg.timestamp}] ${msg.name} ${msg.surname}: ${msg.text}`;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    });

    socket.on('chatHistory', (history) => {
      history.forEach((msg) => {
        const item = document.createElement('li');
        item.classList.add('p-2');
        item.textContent = `[${msg.timestamp}] ${msg.name} ${msg.surname}: ${msg.text}`;
        messages.appendChild(item);
      });
    });
  });