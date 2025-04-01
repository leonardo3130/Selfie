# Final Report

## Introduction

Our project implements all components of extensions 18-27 as specified in the Selfie project for the academic year 23-24. The only exception is the chat minihub, which we implemented following extension 18-33.

## Group Members

| Name | ID | Email |
|--|--|--|
| Leonardo Po | 1069156 | leonardo.po@studio.unibo.it |
| Andrea Fiorellino | 1089150 | andrea.fiorellino@studio.unibo.it |
| Luca Silvestri | 1080369 | luca.silvestri9@studio.unibo.it |

## Work Distribution

- **Leonardo Po:** Activities, events, notes, homepage, pomodoro-calendar integration, event and group activity invitations, time machine, notification daemon, desktop notifications.
- **Luca Silvestri:** Pomodoro, pomodoro-calendar integration, homepage.
- **Andrea Fiorellino:** Authentication, frontend refinement, event import/export with ICal, event and group activity invitations, chat, email notifications.

## Use of Generative AI

All group members used AI for code completion, particularly Codeium and Github Copilot.

Large Language Models were used for various purposes:

- **Debugging support**: TS compiler errors are often long and poorly formatted. We used LLMs (ChatGPT and Llama-3.3-70b) to format error messages and provide explanations.
- **Note testing support**: To verify correct Markdown text generation, we generated some notes using AI.
- **React + Bootstrap component generation**: Useful for simple components but often required manual modifications.

## Main Technologies and Libraries Used

- **Typescript**: Chosen for explicit types and complex object management.
- **React**: Chosen for UI management and extensive resource ecosystem.
- **Bootstrap**: Chosen for easy and fast UI development.
- **NodeJs & Express**: Used for backend and API development.
- **MongoDB**: Used as the database.

## Tools Used

- **IDE/text editor**: Two members used VSCode, one used Neovim.
- **Postman**: Used for API testing and debugging.

## Specifications

### Authentication and Navigation

- **Navigation**: The app manages pages via the React router. Access to protected pages is restricted to authenticated users.
- **JWT Token & Cookie**: Authentication uses JWT tokens stored in cookies with a 3-day expiration.

### Chat

- Accessible via a modal in the homepage.
- Allows sending and receiving messages.
- Enables starting new chats by searching for a user.

### Calendar

- **Events**: Creation, modification, deletion, and support for recurring events. Ability to set "Do Not Disturb" and "Pomodoro" events.
- **Tasks**: Incomplete tasks are moved to the next day.
- **Event and Task Invitations**: Invitations sent via email with abuse protection.

### Notes

- Markdown note preview with filters for tags, visibility, and date.
- Editing bar with shortcuts for quick formatting.

### Pomodoro

- Timer implemented using Node.js timer module.
- Advanced functions to auto-generate study settings based on available time.

---

# Relazione Finale

## Introduzione

Il nostro progetto implementa in tutte le sue componenti le estensioni 18-27 indicate nelle specifiche del progetto Selfie per l'AA 23-24. Unica eccezione è il minihub per le chat che abbiamo implementato seguendo l'estensione 18-33.

## Membri del gruppo

| Nome | Matricola | Email |
|--|--|--|
| Leonardo Po | 1069156 | leonardo.po@studio.unibo.it |
| Andrea Fiorellino | 1089150 | andrea.fiorellino@studio.unibo.it |
| Luca Silvestri | 1080369 | luca.silvestri9@studio.unibo.it |

## Suddivisione del lavoro

- **Leonardo Po:** Attività, eventi, note, homepage, integrazione pomodoro-calendario, inviti per eventi e attività di gruppo, time machine, demone notifiche, notifiche desktop.
- **Luca Silvestri:** Pomodoro, integrazione pomodoro-calendario, homepage.
- **Andrea Fiorellino:** Autenticazione, rifinitura frontend, import/export eventi con ICal, inviti per eventi e attività di gruppo, chat, notifiche mail.

## Utilizzo di intelligenza artificiale generativa

Tutti i membri del gruppo hanno fatto uso di AI per completamento del codice, in particolare Codeium e Github Copilot.

Large Language Models sono stati utilizzati per diversi scopi:

- **Supporto nel debugging**: Gli errori restituiti dal compilatore TS sono spesso lunghi e mal formattati. Abbiamo utilizzato LLMs (ChatGPT e Llama-3.3-70b) per formattare i messaggi di errore e fornire spiegazioni.
- **Supporto nel testing delle note**: Per verificare la generazione corretta del testo in Markdown, abbiamo generato alcune note tramite AI.
- **Generazione di componenti React + Bootstrap**: Utile per componenti semplici, ma spesso richiedeva modifiche manuali.

## Tecnologie e librerie principali utilizzate

- **Typescript**: Scelto per i tipi espliciti e la gestione di oggetti complessi.
- **React**: Selezionato per la gestione dell'interfaccia utente e il vasto ecosistema di risorse.
- **Bootstrap**: Scelto per facilitare la costruzione di interfacce utente.
- **NodeJs & Express**: Utilizzati per il backend e API.
- **MongoDB**: Utilizzato come database.

## Strumenti utilizzati

- **IDE/editor di testo**: Due membri hanno usato VSCode, uno Neovim.
- **Postman**: Utilizzato per il testing e debugging delle API.

## Specifiche

### Autenticazione e Navigazione

- **Navigazione**: L'app gestisce le pagine tramite il router di React. L'accesso alle pagine protette è vincolato all'autenticazione.
- **Token JWT & Cookie**: L'autenticazione utilizza JWT memorizzati nei cookie con una durata di 3 giorni.

### Chat

- Accessibile tramite un modale nella homepage.
- Permette l'invio e la ricezione di messaggi.
- Consente di avviare nuove chat cercando un utente.

### Calendario

- **Eventi**: Creazione, modifica, eliminazione e supporto per eventi ricorrenti. Possibilità di impostare eventi "non disturbare" e "Pomodoro".
- **Attività**: Le attività incomplete vengono trascinate al giorno successivo.
- **Inviti a Eventi e Attività**: Inviti inviati via email con protezione contro abusi.

### Note

- Visualizzazione in Markdown con filtri per tag, visibilità e data.
- Barra di editing con shortcut per formattazione rapida.

### Pomodoro

- Timer implementato con il modulo timer di Node.js.
- Funzioni avanzate per generare automaticamente impostazioni di studio basate sul tempo disponibile.

