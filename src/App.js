import React from 'react';
import GoogleYolo from './GoogleYolo'
import './App.css'

function App() {
  const onChangeCredential = (credential) =>{
  console.log(credential);

}

  return (
    <GoogleYolo  getCredential={onChangeCredential} position={'bottomSheet'|| 'navPopout'} />
  );
}

export default App;
