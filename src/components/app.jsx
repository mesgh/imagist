import React, { useState } from "react";


export function App(props) {
  const [loading, setLoading] = useState(false);
  const [imgPath, setImgPath] = useState("");
  const [name, setName] = useState(false);
  const [inURL, setInURL] = useState(false);
  const [outURL, setOutURL] = useState(false);
  const max_file_size = 15 * 1024 * 1024;

  async function submitHandlerUpload(event) {
    event.preventDefault();
    const file = event.target.elements.image.files[0];
    console.log(file);
    setName(file.name);
    if (!file) return;
    if (file.size >= max_file_size) {
      alert('Too large file!');
      return;
    }
    setLoading(true);
    const blob = new Blob([file]);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = async () => {
      const request = {
        operation: 'upload',
        name: file.name,
        file: reader.result
      };

      let response = await fetch('https://ewo3spohhk.execute-api.us-east-2.amazonaws.com/default/Imagist', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      response = await response.json();
      if (response.success) {
        setInURL(response.inURL);
        setImgPath(inURL);
      } else {
        alert(response.error);
      }
      setLoading(false);
    };
  }

  async function submitHandlerEdit(event) {
    event.preventDefault();
    setLoading(true);
    const {
      colors,
      flip_h,
      flip_v,
      rotate,
      bg,
      resize_x,
      resize_y,
      brightness,
      contrast,
      blur,
      posterize,
      pixelate
    } = event.target.elements;
    const request = {
      operation: 'transform',
      name,
      colors: colors.value,
      flip_h: flip_h.checked,
      flip_v: flip_v.checked,
      rotate: parseInt(rotate.value),
      bg: parseInt(bg.value.slice(1) + 'ff', 16),
      resize_x: parseInt(resize_x.value),
      resize_y: parseInt(resize_y.value),
      brightness: parseInt(brightness.value) / 100,
      contrast: parseInt(contrast.value) / 100,
      blur: parseInt(blur.value),
      posterize: parseInt(posterize.value),
      pixelate: parseInt(pixelate.value)
    };

    let response = await fetch('https://ewo3spohhk.execute-api.us-east-2.amazonaws.com/default/Imagist', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    response = await response.json();
    if (response.sucsess) {
      setOutURL(response.outURL);
      setImgPath(outURL);
    } else {
      alert(response.error);
    }
    setLoading(false);
  }

  async function downloadHandler(event) {
    event.preventDefault();
    const response = await fetch(`api/download/?path=${imgPath}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await response.blob());
    a.download = imgPath.split('-')[1];
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function clearHandler(event) {
    event.preventDefault();
    setImgPath("");
  }

  return (
    <React.Fragment>
      <form
        onSubmit={submitHandlerUpload}
        className={imgPath ? "hidden" : "text-center bg-blue-100"}
      >
        <h1 className="text-2xl sm:text-5xl mt-5">Wellcome to Imagist!</h1>
        <h2 className="text-lg sm:text-3xl my-2">Let's manipulate your image:</h2>
        <label className="btn btn--purple">
          Choose file
          <input type="file" name="image" accept="image/*" className="hidden" />
        </label>
        <button className="btn btn--red" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      <div className={imgPath ? "sm:flex" : "hidden"}>
        <div className="sm:w-1/2 w-full">
          <img src={imgPath} className="mx-auto" />
        </div>
        <form onSubmit={submitHandlerEdit} className="sm:w-1/2 p-3 w-full">
          <fieldset>
            Colors:
            <br />
            <label>
              <input type="radio" className="hidden" name="colors" value="invert" />
              <span className="hint">Invert</span>
            </label>
            <label>
              <input type="radio" className="hidden" name="colors" value="greyscale" />
              <span className="hint">Greyscale</span>
            </label>
            <label>
              <input type="radio" className="hidden" name="colors" value="sepia" />
              <span className="hint">Sepia</span>
            </label>
            <label>
              <input type="radio" className="hidden" name="colors" value="" />
              <span className="hint">None</span>
            </label>
            <br />
            <input type="number" className="form-input" name="brightness" min="-100" max="100" placeholder="brightness" />
            <input type="number" className="form-input" name="contrast" min="-100" max="100" placeholder="contrast" />
          </fieldset>
          <fieldset>
            Effects:
            <br />
            <input type="number" className="form-input" name="blur" min="0" max="99" placeholder="blur" />
            <input type="number" className="form-input" name="posterize" min="0" max="29" placeholder="posterize" />
            <input type="number" className="form-input" name="pixelate" min="0" max="99" placeholder="pixelate" />
          </fieldset>
          <fieldset>
            Flip:
            <br />
            <label>
              <input type="checkbox" className="hidden" name="flip_h" />
              <span className="hint">Horisontal</span>
            </label>
            <label>
              <input type="checkbox" className="hidden" name="flip_v" />
              <span className="hint">Vertical</span>
            </label>
          </fieldset>
          <div className="flex">
            <fieldset>
              Rotate🔄:
              <br />
              <input type="number" className="form-input" name="rotate" min="0" max="359" placeholder="0-359" />
            </fieldset>
            <fieldset>
              Background:
              <br />
              <input type="color" className="form-input" name="bg" />
            </fieldset>
          </div>
          <fieldset>
            Resize:
            <br />
            <input type="number" className="form-input" name="resize_x" min="0" max="4999" placeholder="width" />
            <input type="number" className="form-input" name="resize_y" min="0" max="4999" placeholder="height" />
          </fieldset>
          <button type="submit" className="btn btn--green" disabled={loading}>{loading ? "Transforming..." : "Transform"}</button>
          <button onClick={downloadHandler} className="btn btn--purple" disabled={loading}>Download</button>
          <button onClick={clearHandler} className="btn btn--red" disabled={loading}>Clear</button>
        </form>
      </div>
    </React.Fragment>
  );
}
