import { Manager, Socket } from "socket.io-client";

let socket: Socket;

export const connectToServer = (token: string) => {
	const manager = new Manager(
		"https://teslo-shop-production-ea41.up.railway.app/socket.io/socket.io.js",
		{
			extraHeaders: {
				hola: "mundo",
				authentication: token,
			},
		}
	);

	socket?.removeAllListeners();
	socket = manager.socket("/");
	addListeners();
};

const addListeners = () => {
	const serverStatusLabel = document.querySelector("#server-status")!;
	const clientsUl = document.querySelector("#clients-ul")!;

	const messageForm =
		document.querySelector<HTMLFormElement>("#message-form")!;
	const messageInput =
		document.querySelector<HTMLInputElement>("#message-input")!;

	const messagesUl =
		document.querySelector<HTMLUListElement>("#messages-ul")!;

	socket.on("connect", () => {
		serverStatusLabel.innerHTML = "connected";
	});

	socket.on("disconnect", () => {
		serverStatusLabel.innerHTML = "disconnected";
	});

	socket.on("clients-updated", (clients: string[]) => {
		console.log({ clients });
		let clientsHtml = "";
		clients.forEach((client) => {
			clientsHtml += `<li>${client}</li>`;
		});

		clientsUl.innerHTML = clientsHtml;
	});

	messageForm.addEventListener("submit", (e) => {
		e.preventDefault();
		if (messageInput.value.trim().length <= 0) return;
		socket.emit("message-from-client", {
			id: "123",
			message: messageInput.value,
		});

		messageInput.value = "";
	});

	socket.on(
		"message-from-server",
		(payload: { fullName: string; message: string }) => {
			const newMessage = `
				<li>
				<strong>${payload.fullName}</strong>
				<span>${payload.message}</span>
				</li>
			`;

			const li = document.createElement("li");
			li.innerHTML = newMessage;
			messagesUl.append(li);

			if (messagesUl.innerHTML.trim().length === 0) {
				messagesUl.innerHTML = newMessage;
			} else {
				messagesUl.innerHTML += newMessage;
			}
		}
	);
};
