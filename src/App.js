import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import ParticlesBg from 'particles-bg'
//import Clarifai from 'clarifai';
//<script>process="test"</script>inside index.html type="tadpole"
//https://static.toiimg.com/photo/msid-79853640/79853640.jpg

// const particlesOptions = {
//   particles: {
//     number: {
//       value: 30,
//       density: {
//         enable: true,
//         value_area: 800
//       }
//     }
//   }
// }

// const Clarifai = require('clarifai');
 
// const app = new Clarifai.App({
//  apiKey: '5adb88750781456b9d9b5b98b294c918'
// });

const returnClarifaiRequestOptions = (imageUrl) => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '0499b64e687d4db29f5378c3640e6221';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'microgenius';       
    const APP_ID = 'my-first-application';
    // Change these to whatever model and image URL you want to use
    //const MODEL_ID = 'face-detection';
    // const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';    
    const IMAGE_URL = imageUrl;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    return requestOptions

}

    

class App extends Component{
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false
    }
  }

  calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height) 
        }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

   onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

   onButtonSubmit = (event) => {
    this.setState({imageUrl: this.state.input})
    //app.models.predict('face-detection', this.state.input)
    fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
          .then(response => response.json())
          .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
          .catch(err => console.log(err));
      
  }

  onRouteChange = (route) => {
    if (route === 'signout'){
        this.setState({isSignedIn: false});
    } else if (route === 'home') {
        this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="fountain" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
            ? <div>
                <Logo />
                <Rank />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                <FaceRecognition box={box} imageUrl={imageUrl} />
             </div>
            : (
                route === 'signin' 
                ? <SignIn onRouteChange={this.onRouteChange}/>
                : <Register onRouteChange={this.onRouteChange}/>
                )
            
            
        }
      </div>
    );
  }
}

export default App;