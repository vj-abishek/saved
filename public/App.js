async function checkIfAlreadySaved(usor, repo, db) {
    const result = await db.repo.where('repo').equals(`${usor}/${repo}`).toArray();
    return result.length >= 1;
}

async function toggleSaveBtn(btnEl, state = 0) {
    if (state) {  //Saved
        btnEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        Saved
    `}
    else { //Save
        btnEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Save
        `
    }
}

window.onload = async () => {

    const db = new Dexie('save_database');
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


    let html = `
        <li>
            <div id="save_me_button" class="btn btn-sm save_button">
            </div>
        </li>
    `
    const pageActions = document.querySelector('.pagehead-actions')

    // Save button
    if (pageActions !== null) {
        pageActions.innerHTML = pageActions.innerHTML + html

        const save_me_button = document.querySelector('#save_me_button')
        toggleSaveBtn(save_me_button, 0);
        const [, usor, repo] = location.pathname.split('/')

        if (await checkIfAlreadySaved(usor, repo, db)) {
            toggleSaveBtn(save_me_button, 1);
        }


        save_me_button.addEventListener('click', async () => {
            if (await checkIfAlreadySaved(usor, repo, db)) {
                try {
                    const saved = await db.repo.where('repo').equals(`${usor}/${repo}`);
                    saved.delete().then(() => { console.log("saved ext:", "delete success") });
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
        })
    }


    // Saved page

    if (isSave) {
        const main = document.querySelector('main');
        main.classList.add("saved-main");
        main.innerHTML = `
          <h1 class="sr-only"> Saved</h1>
          <h2 class="your-saved-txt">Your saved</h2>
         `

        const content = await db.repo.reverse().toArray();

        if (content.length >= 1) {
            content.forEach((con) => {
                const date = new Date(con.createdAt)
                main.innerHTML += `
                <div class="news">
                    <ul>
                        <li class="col-12 d-flex width-full py-4 border-bottom color-border-secondary public fork">
                            <h3 class="wb-break-all">
                                <a href="${con.repo}">${con.repo.split('/')[1]}</a>
                                <div class="color-text-secondary" style="font-size: 14px">SavedAt: ${date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit'
                })}</div>
                            </h3>
                        </li>
                    </ul>
                </div>
            `
            })
        } else {
            main.innerHTML = `
            <h1 class="sr-only"> Saved</h1>
            <div class="news">
                <h2 class="your-saved-txt">Your saved</h2>

                <h1 class="text-center">Nothing to show</h1>
            </div>
            `
        }

    }
}