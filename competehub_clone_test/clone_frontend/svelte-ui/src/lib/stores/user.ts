import { writable } from 'svelte/store';

export interface User {
	id: string;
	name: string;
	email: string;
	username: string;
	elo: number;
	wins: number;
	matches: number;
	xp: number;
	rank: string;
	avatar?: string;
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable(false);

export function login(userData: User) {
	user.set(userData);
	isAuthenticated.set(true);
}

export function logout() {
	user.set(null);
	isAuthenticated.set(false);
}
