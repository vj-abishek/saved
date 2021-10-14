async function checkIfAlreadySaved(usor, repo, db) {
    const result = await db.repo.where('repo').equals(`${usor}/${repo}`).toArray();
    return result.length >= 1;
}

function toggleSaveBtn(btnEl = null, state = 0, immediate = false) {

    if (state) {  //Saved
        const template = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        Saved
    `
        return immediate ? template : btnEl.innerHTML = template
    }

    //Save
    const template =  `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
    Save
    `
    return immediate? template : btnEl.innerHTML = template
}

let db = null;

const savedOnUI = (date) => `
<div class="d-flex flex-row mt-2 mb-2 color-text-secondary text-small">
     <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
     </svg>
     <div class="pl-2">${date.toLocaleDateString('en-US', {
         month: 'long',
         day: '2-digit',
         year: 'numeric',
         hour: '2-digit'
     })}</div>
</div>
`

const handleSaveBtnClick = async ({ target }) => {
    if(target.dataset.savedpathname && db) {
        const { savedpathname } = target.dataset
        const save_me_button = document.querySelector(`.saved_button[data-savedpathname="${savedpathname}"]`)
        const [usor, repo] = savedpathname.split('/')
        if (await checkIfAlreadySaved(usor, repo, db)) {
            try {
                await db.repo.where('repo').equals(`${usor}/${repo}`).delete();
                console.log("saved ext:", "delete success");
            }
            catch (e) {
                console.error("saved ext:", e);
            }
            toggleSaveBtn(save_me_button, 0);
            return;
        };

        toggleSaveBtn(save_me_button, 1);
        await db.repo.add({ repo: `${usor}/${repo}`, createdAt: Date.now() })
        console.log('saved ext:', `${usor}/${repo}`)
    }
}

const main = async () => {

    db = new Dexie('save_database');
    db.version(1).stores({
        repo: '++id, repo',
    });

    // your Saved link

    const isSave = window.location.search === '?save=1';
    if (!isSave) {
        const nav = document.querySelector('nav')

        const a = document.createElement('a')
        a.role = "menuitem"
        a.href = "/?save=1"
        a.innerText = "Your saved"
        a.classList.add("Header-link")
        nav.appendChild(a)
    }

    // Saved page

    if (isSave) {
        const main = document.querySelector('main');
        main.classList.add("saved-main");

        // get saved data from indexeddb
        const savedArray = await db.repo.reverse().toArray();

        let yourSavePageContent = `
            <h1 class="sr-only"> Saved</h1>
            <h2 class="f4 text-normal pt-md-3 mb-2">Your saved</h2>
            <ul class="d-grid-your-saved">
        `
        if (savedArray.length >= 1) {
            savedArray.forEach((savedData) => {
                const date = new Date(savedData.createdAt)
                yourSavePageContent += `
                        <li class="col-auto px-3 py-2 border color-border-secondary your-saved-page-content">
                        <div class="d-flex flex-row inside-flex">
                            <h3 class="wb-break-all">
                                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-repo color-text-secondary flex-shrink-0">
                                    <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                                </svg>
                                <a class="repo" title="${savedData.repo}" href="${savedData.repo}">${savedData.repo}</a>
                                ${savedOnUI(date)}
                            </h3>
                            <div id="save_me_button" data-savedpathname="${savedData.repo}" style="height: 28px" class="btn btn-sm saved_button mt-2">
                                ${toggleSaveBtn(null, 1, true)}
                            </div>
                        </div>
                        </li>
            `
            })
            yourSavePageContent += `
                </ul>
            `;
            main.innerHTML = yourSavePageContent
            return;
        }

        main.innerHTML = `
        <h1 class="sr-only"> Saved</h1>
        <div class="news">
            <h2 class="f4 text-normal pt-md-3">Your saved</h2>

            <h2 class="text-center mt-2">Nothing to show</h2>
        </div>
        `

    }


    // Save button
    const pageActions = document.querySelector('.pagehead-actions')

    if (pageActions !== null) {

        let html = `
        <li>
            <div id="save_me_button" data-savedpathname="${location.pathname.slice(1)}" class="btn btn-sm saved_button">
            </div>
        </li>
    `
        pageActions.innerHTML = pageActions.innerHTML + html

        const save_me_button = document.querySelector('#save_me_button')
        toggleSaveBtn(save_me_button, 0);
        const [, usor, repo] = location.pathname.split('/')

        if (await checkIfAlreadySaved(usor, repo, db)) {
            toggleSaveBtn(save_me_button, 1);
        }
    }
}

window.addEventListener('load', main)
window.addEventListener('click', handleSaveBtnClick)