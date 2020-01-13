import React,{useEffect} from 'react'
import './GoogleYolo.css'

export default function GoogleYolo({getCredential,position,CLIENT_ID}) {

    const signInWithCredential = (credential) =>{
        getCredential(credential);
    }



    useEffect(() => {
        const PUBLIC_CLIENT_ID = '412842310182-nnsbnt2ropvf4ujenj9ueib2vupdd5sj.apps.googleusercontent.com'

        const CONFIG = {
          supportedAuthMethods: [
            'https://accounts.google.com'
          ],
          supportedIdTokenProviders: [{
            uri: 'https://accounts.google.com',
            clientId: PUBLIC_CLIENT_ID
          }],
          context: "signUp"
        };

        window.addEventListener('message', (event) => {

            switch(event.data.type) {
                case 'verifyPing':
                  // This part handles the initial handshake by the Google Yolo iframe.
                  // It is sent by OpenYOLO https://github.com/openid/OpenYOLO-Web/blob/dc841704619d7801da0b860c91953ff730fca07f/ts/protocol/post_messages.ts#L27
                  break;
                case 'readyForConnect':
                  // The user selected a credential.
                  break;
                case 'error':
                  // An error happened.
                  console.log('Error:', event.data.error);
                  break;
                case 'channelReady':
                  // Update the parent <iframe> height to match GoogleYolo <iframe> height

                  break;
                default:
                  // Do nothing.
              }
        })

        window.onGoogleYoloLoad = (googleyolo) => {
        // Set the rendering mode of the IFrame. By default, Google Yolo iframe will decide
        // by itself where to position (based on the userAgent). bottomSheet is at the bottom
        // of the screen on mobile, navPopout is the top right card on desktop. Forcing the
        // rendering mode here to a single value makes sure that we have consistent behavior
        // when positioning this iframe.
        
        // openyolo is a global reference to https://github.com/openid/OpenYOLO-Web, which is
        // what Google Yolo uses under the hood. Hopefully we can call setRenderMode on the
        // googleyolo object itself soon.
        googleyolo.setRenderMode(position || 'navPopout'); //navPopout // bottomSheet

        const retrievePromise = googleyolo.retrieve(CONFIG).then((credential) => {
            console.log('retrievePromise',credential);
            if (credential) {
            //   user selected credential, use it to sign in
              return signInWithCredential(credential);
            } else {
            //   no credential selected, so do the manual authentication flow
              return hintPromise;
            }
          }, (error) => {
            if (error.type === 'noCredentialsAvailable') {
                return hintPromise;  
            }                
          }) 


          const hintPromise = googleyolo.hint(CONFIG).then((credential) => {
            return signInWithCredential(credential);

        }, (error) => {
          if (error.type === 'noCredentialsAvailable') {
            window.document.body.innerHTML = '<img src="https://yatriadda.com/google_login/images/glogin.png"/>';
          }
        });

        // let savePromise = googleyolo.save({
        //     id: 'jdoe@example.com',
        //     authMethod: 'openyolo://id-and-password',
        //     displayName: 'Jane Doe',
        //     password: 'correctH0rseBatteryStapl3',
        //     profilePicture: 'https://robohash.org/694ea0904ceaf766c6738166ed89bafb'
        //   });

        // GoogleYolo doesn't insert their iframe immediately. This mutation
        // observer watches the <body> to tell when they insert the <iframe> so
        // we can style as needed.
        const bodyObserver = new MutationObserver(mutationsList => {
          mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
              if (node.nodeName === 'IFRAME' && node.src.includes('smartlock.google.com/iframe/')) {
                bodyObserver.disconnect();

                node.classList.add('google-inserted-frame');

                // We need one more observer to watch the <iframe> that Google Yolo
                // inserted. Its style attribute will be updated with a height that
                // needs to be passed back up to the parent iframe, to avoid any
                // clipping. The height can change if the user is signed in with
                // many Google accounts, and clicks the 'X more accounts' button.
                const attributeObserver = new MutationObserver(iframeMutationsList => {
                  let height = parseInt(iframeMutationsList[0].target.style.height);
                  
                  if (height === 341) {
                    // One account is shown
                    height = 228 - 18;
                  }
                  else if (height === 261) {
                    // Two accounts shown
                    height = 177;
                  }
                  else if (height === 298) {
                    // Three or more accounts shown
                    height = 215;
                  }
                  else {
                    // Likely the expanded state, let true height through, minus top padding
                    height -= 18;
                  }
                  
                //   messageParent({type: 'height', height});
                });

                attributeObserver.observe(node, { attributes: true });
              }
            });
          });
        });

        bodyObserver.observe(window.document.body, { childList: true });

        }



        const script = document.createElement('script');
        script.src = "https://smartlock.google.com/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        return () => {
          document.body.removeChild(script);
        };

        
  
      }, []);


    
    return (
        <>
            
        </>
    )
}
