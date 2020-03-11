export interface HttpSignInResponseInterface {
  readonly userId: number;
  readonly role: 'customer' | 'provider' | 'administrator';
  readonly token: string;
}
