# Relazione finale
## Introduzione

Il nostro progetto implementa in tutte le sue componenti le estensioni 18-27 indicate nelle specifiche del progetto Selfie per l'AA 23-24. Unica eccezione è il minihub per le chat che abbiamo implementato seguendo l'estensione 18-33.

## Membri del gruppo:

| Leonardo Po | Andrea Fiorellino | Luca SIlvestri |
|--|--|--|
| 1069156 | 1089150 | 1080369 |
|--|--|--|
| leonardo.po@studio.unibo.it | andrea.fiorellino@studio.unibo.it | luca.silvestri9@studio.unibo.it |

## Suddivisione del lavoro

- Leonardo Po: attività, eventi, note, homepage, integrazione pomodoro-calendario, inviti per eventi e attività di gruppo, time machine, demone notifiche, notifiche desktop
- Luca Silvestri: pomodoro, integrazione pomodoro-calendario, homepage
- Andrea Fiorellino: autenticazione, rifinitura frontend, import/export eventi con ICal, inviti per eventi e attività di gruppo, chat, notifiche mail

## Utilizzo di intelligenza artificiale generativa

Tutti i membri del gruppo hanno fatto uso di AI per completamento del codice, in particolare Codeium e Github Copilot.
Large Language Models sono stati utilizzati per diversi scopi:

- supporto nel debugging: molto frequentemente gli erorri di tipo restituiti dal compilatore TS sono errori molto lunghi e mal formattati. Si è rivelato utile e produttivo l'uso di LLMs (ChatGPT e Llama-3.3-70b) chiedendo ad essi di formattare il messaggio di errore e di fornire una possibile spiegazione.
- supporto nel debugging delle note: per testare che la generazione del testo in Markdown funzionasse correttamente, diverse note sono state generate tramite AI per velocizzare il processo di testing
- generazione di componenti React + Boostrap: questo utilizzo è stato il meno frequente in quanto spesso ha portato alla generazione di codice errato o comunque inadatto. Per componenti di ridotte dimensioni e caratterizzati da funzionalità semplici è stato utile, ma ha comunque richiesto la modifica del codice generato.

## Tecnologie e librerie/framework principali utilizzati

- Typescript: abbiamo preferito TS rispetto a JS per la presenza dei tipi espliciti. Inoltre il linguaggio consente la creazione di tipi custom, funzionalità rivelatasi molto utile nella gestione di oggetti complessi come quelli che rappresentano eventi, attività e note.
- React: abbaimo scelto React per la gestione dell'interfaccia utente. Nonostante all'inizio non sia particolarmente intuitivo, lo abbiamo scelto per l'importante presenza di risorse e documentazioni online. Inoltre ha un vastissimo ecosistema di librerie aggiuntive che hanno facilitato lo sviluppo.
- Boostrap: abbaimo scelto Bootstrap per la sua facilità nel costruire interfacce utente apprezzabili, funzionali in tempi fortemente ridotti.
- NodeJs & Express: sono le tecnologie utilizzate per implementare il backend e l'API dell'applicazione. Questa tecnologie sono state scelte in quanto spiegate a lezione e anch'esse caratterizzate da un vastissimo ecosistema di librerie utili.
- Zod + React Hook Form: queste librerie si sono rivelate utili per gestire con facilità lo state di form molto complessi (es. il form per la rrule), zod è stata usata per fornire degli schema di validazione dei form, dai quali è stato possibile derivare tipi complessi sfruttando la type inference di TypeScript.
- rrule: libreria TS rivelatasi fondamentale per calcolare le regole di ricorrenza e le date di occorrenza di eventi ricorrenti.
- mongoDB come database

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

### **Eventi**

Il calendario consente di aggiungere, modificare, eliminare eventi di cui l'utente è proprietario.
L'utente può inoltre creare due tipi di eventi speciali:

 - Evento "non disturbare", questo evento comporta il rifiuto automatico di tutte le richieste di partecipazione a eventi/attivitò di gruppo
 sovrapposti all'evento "non disturbare".
 - Evento Pomodoro, come da specifiche l'utente può definire un evento che include una sessione di studio Pomodoro

Gli eventi posso essere ricorrenti, il form per la recurrency rule consente vari pattern di ripetizione dell'evento.
L'utente può sceglire luogo e timezone per l'evento. In caso di timezone diversa da quella in cui l'utente è situato, vengono visualizzati entrambi gli orari.

Per consentire un inserimento velocizzato degli eventi, è possibile scegliere l'intervallo di tempo trascinando il cursore dall'inizio alla fine dell'intervallo,
al rilascio viene automaticamente aperto il modale di input con le date già compilate nel form.

### **Attività**

Le attività hanno modalità di input simile a quella degli eventi.
Come da specifiche, se non completate si trascinano al giorno successivo. Dopo il trasferimento nei giorni successivi, se l'utente
ha definito un pattern di notifiche per l'attività, questo pattern verrà ripetuto dopo ogni spostamento dell'attività.


### **Inviti a Eventi e Attività**

L’invio degli inviti a eventi o attività di gruppo avviene tramite la libreria Nodemailer e l’account Gmail [brady.unibo@gmail.com](mailto:brady.unibo@gmail.com). Gli utenti possono accettare o rifiutare l’invito tramite un link ricevuto via email.

Per prevenire abusi, se un malintenzionato entra in possesso del link:

- Potrà accedere alla pagina del form.
- Tuttavia, al momento dell’invio, il sistema restituirà un errore 401.

Il sistema tiene traccia della consegna dell’invito e dell’esito della risposta.

### **Import / Export di Eventi**
L'import di file .ics è stato realizzato con la libreria node-ical.
L'export del calendario con file .ics è stato possibile grazie alla libreria ical-generator.

Per l'utente selfie è possibile importare/esportare anche attività. Infatti ical-generator consente di definire delle proprietà custom dei file .ics
che ci hanno permesso di rendere importabili anche le attività oltre agli eventi.

## Note
La pagina delle note consente la visualizzazione delle note con preview in MD, queste possono essere filtrate attraverso un apposito form per:
 - tag
 - visibilità: pubbliche, di gruppo, private
 - data: comprese in un specifico intervallo di tempo

Inoltre è possibile riordinarle per lunghezza, ordine alfabetico e data di creazione.

Per facilitare l'editing, il form delle note è provvisto di una barra che consente di usare shortcut per:
 - creazione degli header
 - creazione di tabelle
 - inserimento di link
 - inserimento di immagini
 - testo in corsivo e in grassetto
 - creazione di liste non ordinate

##  **Pomodoro**
La pomodoro app si sviluppa a partire dal file Pomodoro.tsx nel quale vengono definiti i componenti realtivi ai bottoni
della main page del Pomodoro.
Il timer è implementato all'interno del componente start e per tenere traccia del corretto scorrimento del
tempo si è fatto uso del modulo timer di node, in particolare delle funzioni setInterval e setTimerId.
3 variabili di tipo Time tengono traccia di:
 - tempi di studio e riposo preimpostati dall'utente
 - tempo effettivo che sta segnando il timer

Il tipo Time è stato appositamente implementato e contiene 3 variabili di tipo number realtive a secondi, minuti e ore.

Il componenete impostazioni che si trova nel file PomodoroSettings.tsx presenta 3 caselle di input per la selezione di tempo di riposo, tempo di studio e numero di cicli
desiderati, il bottone per il salvataggio e il bottone per l'annullamento.
Una impostazione viene passata alla pomodoro app come istanza del tipo PomodoroSetting, il quale racchiude in formato zod i 3
parametri che l'utente ha selezionato.
E' inoltre possibile accedere attraverso apposito bottone alla pagina per la generazione automatica di impostazioni, il cui componente
è implementato nel file PomSuggestion.tsx.

Il componente suggestions è costituito da 2 caselle di input per l'inserimento del tempo a disposizione (minuti e ore) e dalla sezione
nella quale vengono generate le cards selezionabili con i suggerimenti di studio.
Attraverso lo hook useEffect i suggerimenti vengono continuamente aggiornati in base al tempo inserito in input.
Il calcolo dei possibili suggerimenti viene effettuato dalle funzioni generateSettings e generateDivision (file pomUtils.tsx).

La funzione generateSettings calcola con generateDivision le possibli suddivisioni del tempo passato come parametro e restituisce un array di possibili impostazioni di studio con una definita proporzione tra tempo di studio(85%) e tempo di riposo(15%).

GenerateDivision è una funzione ricorsiva che, passato un number, genera un array di suoi divisori possibilmente con resto 0, altrimenti con resto
molto basso. Il parametro tollerance viene incrementato a ogni chiamata ricorsiva e indica il resto relativo ai divisiori target di quella chiamata. Il
suo valore massimo (5) è stato scelto per ottenere il giusto trade-off tra quantità di impostazioni possibili proposte all'utente
e "imprecisione" di queste rispetto al tempo inserito dall'utente, che si discosta dai tempi proposti di al massimo 5 minuti.

L'animazione per il timer del pomodoro è definita nei componenti disappearingCircle e SecondsCircle, implemementati nei rispettivi file.
Per la rappresentazione grafica dei cerchi entrambi fanno uso del componente predefinto svg al cui interno è inserito un elemento circle.
La variabile strokeDashoffset determina la porzione di cerchio che viene nascosta in ogni istate di tempo e varia in base al parametro timeLeft passato al componente.
