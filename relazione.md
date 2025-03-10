# Introduzione

Il nostro progetto implementa in tutte le sue componenti le estensioni 18-27 indicate nelle specifiche del progetto Selfie per l'AA 23-24. Unica eccezione è il minihub per le chat che abbiamo implementato seguendo l'estensione 18-33.

## Membri del gruppo:

Leonardo Po 1069156
Andrea Fiorellino 1089150
Luca Silvestri 1080369

## Suddivisione del lavoro

- Leonardo Po: attività, eventi, note, homepage, integrazione pomodoro-calendario, inviti per eventi e attività di gruppo, time machine, demone notifiche, notifiche desktop
- Luca Silvestri: pomodoro, integrazione pomodoro-calendario, homepage
- Andrea Fiorellino: autenticazione, rifinitura frontend, import/export eventi con ICal, inviti per eventi e attività di gruppo, chat, notifiche mail

## Utilizzo di intelligenza artificiale generativa

Tutti i membri del gruppo hanno fatto uso di AI per completazione del codice, in particolare Codeium e Github Copilot.
Large Language Models sono stati utilizzati per diversi scopi:

- supporto nel debugging: molto frequentemente gli erorri di tipo restituiti dal compilatore TS sono errori molto lunghi e mal formattati. Si è rivelato utile e produttivo l'uso di LLMs (ChatGPT e Llama-3.3-70b) chiedendo ad essi di formattare il messaggio di errore e di fornire una possibile spiegazione.
- supporto nel debugging delle note: per testare che la generazione del testo in Markdown funzionasse correttamente, diverse note sono state generate tramite AI per velocizzare il processo di testing
- generazione di componenti React + Boostrap: questo utilizzo è stato il meno frequente in quanto spesso ha poratto alla generazione di codice errato o comunque inadatto. Per componenti di ridotte dimensioni e caratterizzati da funzionalità semplici è stato utile, ma ha comunque richiesto la modifica del codice generato.

## Tecnologie e librerie/framework principali utilizzati

- Typescript: abbiamo preferito TS rispetto a JS per la presenza dei tipi espliciti. Inoltre il linguaggio consente la creazione di tipi custom, funzionalità rivelatasi molto utile nella gestione di oggetti complessi come quelli che rappresentano eventi, attività e note.
- React: abbaimo scelto React per la gestione dell'interfaccia utente. Nonostante all'inizio non sia particolarmente intuitivo, lo abbiamo scelto per l'importante presenza di risorse e documentazioni online. Inoltre ha un vastissimo ecosistema di librerie aggiuntive che hanno facilitato lo sviluppo.
- Boostrap: abbaimo scelto Bootstrap per la sua facilità nel costruire interfacce utente apprezzabili, funzionali in tempi fortemente ridotti.
- NodeJs & Express: sono le tecnologie utilizzate per implementare il backend e l'API dell'applicazione. Questa tecnologie sono state scelte in quanto spiegate a lezione e anch'esse caratterizzate da un vastissimo ecosistema di librerie utili.
- Zod + React Hook Form: queste libreria si sono rivelate per gestire con facilità lo state di form molto complessi (es. il form per la rrule), zod è stata usata per fornire degli schema di validazione dei form, 202 dai quali è stato possibile derivare tipi complessi sfruttando la type inference di TypeScript.
- rrule: libreria TS rivelatasi fondamentale per calcolare le regole di ricorrenza e le date di occorrenza di eventi ricorrenti.
- mongoDB come database

Altri dettagli su altre librerie utilizzate verranno forniti nelle specifiche sezione sottostanti.

## Strumenti utilizzati

- IDE/text editor: due componenti del gruppo hanno usate VSCode, il terzo mebro ha usato neovim.
- Postman: utilizzato per testing dell'API durante e dopo lo sviluppo (testing e debugging)

# Specifiche

## **Autenticazione e Navigazione**

### **Navigazione**

La gestione delle pagine dell’app è definita in App.tsx, che contiene tutta la logica del router frontend:

- Se l’utente non è autenticato, può accedere solo alle pagine di login e registrazione; qualsiasi altra route lo reindirizzerà automaticamente a queste.
- Dopo il login, diventano disponibili le altre sezioni della navbar: Note, Pomodoro, Calendario, About Us, Homepage e Impostazioni Account.
- Qualsiasi percorso non riconosciuto reindirizzerà alla pagina di errore 404.
- L’autenticazione viene invalidata nei seguenti casi: cancellazione dei cookie, timeout automatico dopo 3 giorni o logout manuale.

### **Token JWT & Cookie**

L’autenticazione del sito si basa su cookie con una durata di 3 giorni e su token JWT. Al momento del login o della registrazione (se avvenuta con successo), il backend genera un cookie contenente il token JWT e lo invia all’utente.

Per accedere alle route protette e alle API che richiedono autenticazione, il backend verifica il token JWT presente nei cookie:

- Se il token è valido e l’utente esiste, viene restituita la risorsa richiesta.
- In caso contrario, viene generato un errore 401 (Non autorizzato).

## **Chat**

La chat, accessibile tramite un modale posizionato in basso a sinistra nella homepage, consente agli utenti di comunicare tra loro. È possibile:

- Inviare messaggi testuali.
- Visualizzare i messaggi ricevuti nelle rispettive conversazioni con gli altri utenti.
- Accedere alla lista delle chat esistenti o avviarne una nuova cercando un utente (tramite la apposita barra).

## **Calendario**

…

### **Inviti a Eventi e Attività**

L’invio degli inviti a eventi o attività di gruppo avviene tramite la libreria Nodemailer e l’account Gmail [brady.unibo@gmail.com](mailto:brady.unibo@gmail.com). Gli utenti possono accettare o rifiutare l’invito tramite un link ricevuto via email.

Per prevenire abusi, se un malintenzionato entra in possesso del link:

- Potrà accedere alla pagina del form.
- Tuttavia, al momento dell’invio, il sistema restituirà un errore 401.

Il sistema tiene traccia della consegna dell’invito e dell’esito della risposta.

### **Import / Export di Eventi**

…

## Note

…

## Pomodoro

## About Us

La pagina *AboutUs* spiega la storia e le funzionalità dell’app *Selfie*, presentando i principali strumenti come calendario, note, chat e pomodoro timer. Illustra le tecnologie usate, fornisce una sezione con i creatori, i loro contatti e il link al repository GitHub.