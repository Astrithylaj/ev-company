// Where the quote form sends requests.
// Without an access key the form opens the visitor's email app (mailto) with the request filled in.
// LAUNCH: create a free Web3Forms key for the company email at https://web3forms.com and paste it below.
// The key is public by design (Web3Forms only ever delivers to the email it was created for).
export const formService = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: '',
  timeoutMs: 15000,
};
