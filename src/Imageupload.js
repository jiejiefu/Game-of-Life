import React from "react";
import ImageUploader from "react-images-upload";
// https://github.com/JakeHartnell/react-images-upload
class Imageupload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pictures: [] };
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(pictureFiles, pictureDataURLs) {
    this.setState({
      pictures: this.state.pictures.concat(pictureFiles)
    });
    console.log("Files Array: " + this.state.pictures);
    console.log(pictureDataURLs);
    console.log(JSON.stringify(this.state.pictures, null, 2));
  }

  render() {
    return (
      <ImageUploader
        withIcon={true}
        buttonText="Choose images"
        onChange={this.onDrop}
        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
        maxFileSize={5242880}
        withPreview={true}
      />
    );
  }
}

export default Imageupload;