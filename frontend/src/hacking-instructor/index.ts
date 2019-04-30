interface HackingInstructorFileFormat {
  challenges: ChallengeInstruction[];
}

interface ChallengeInstruction {
  name: string;
  hints: ChallengeHint[];
}

interface ChallengeHint {
  text: string;
  page: string;
  fixture: {
    type: string;
    value: string;
  };
  position: string;
  hideAfterHint?: boolean;
  resolved: () => Promise<void>;
}

const challengeInstructions: HackingInstructorFileFormat = {
  challenges: [
    {
      name: 'Login Admin',
      hints: [
        {
          text:
            "Log in with the administrator's user account go to the login page.",
          page: 'score-board',
          fixture: {
            type: 'id',
            value: 'loginButton',
          },
          position: 'right',
          async resolved() {
            const searchbar = document.getElementById(
              'loginButton'
            ) as HTMLInputElement;

            while (true) {
              console.log(window.location.hash);
              if (window.location.hash === '#/login') {
                break;
              }
              await sleep(100);
            }
          },
        },
        {
          text: "Try to log in with ' as email and without a password",
          page: 'login',
          fixture: {
            type: 'id',
            value: 'email',
          },
          position: 'right',
          async resolved() {
            const searchbar = document.getElementById(
              'email'
            ) as HTMLInputElement;

            while (true) {
              if (searchbar.value === "'") {
                break;
              }
              await sleep(100);
            }
          },
        },
        {
          text: 'Now do whatever the fuck you want!',
          page: 'score-board',
          fixture: {
            type: 'id',
            value: 'searchQuery',
          },
          position: 'right',
          async resolved() {
            const searchbar = document.getElementById(
              'searchQuery'
            ) as HTMLInputElement;

            while (true) {
              if (searchbar.value === 'whatever') {
                break;
              }
              await sleep(100);
            }
          },
        },
      ],
    },
  ],
};

function loadHint(hint: ChallengeHint): HTMLElement {
  const elem = document.createElement('div');
  elem.id = 'hacking-instructor';
  elem.style.position = 'absolute';
  elem.style.zIndex = '20000';
  elem.style.backgroundColor = '#4472C4';
  elem.style.maxWidth = '300px';
  elem.style.minWidth = '250px';
  elem.style.padding = '8px';
  elem.style.borderRadius = '8px';
  elem.style.whiteSpace = 'initial';
  elem.style.lineHeight = '1.3';
  elem.style.overflow = '';
  elem.style.top = `8px`;
  elem.innerText = hint.text;

  const target = document.getElementById(hint.fixture.value) as HTMLElement;

  const relAnchor = document.createElement('div');
  relAnchor.style.position = 'relative';
  relAnchor.appendChild(elem);

  if (target.parentElement) {
    target.parentElement.appendChild(relAnchor);
  }

  return relAnchor;
}

const sleep = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

export async function init() {
  console.log('Hacking Instructor Init');

  for (const hint of challengeInstructions.challenges[0].hints) {
    const element = loadHint(hint);
    element.scrollIntoView();

    await hint.resolved();
    element.remove();
  }
}
