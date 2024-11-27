require([
  'jquery',
  'splunkjs/mvc',
  'splunkjs/mvc/simplexml/ready!',
  '/static/app/splunk4champions2/scripts/jquery.qrcode.min.js'
], function($, mvc, qrcode) {

  /* some constant variables */
  const gitlab_project_id = '60356749';
  const gitlab_subfolder_path = 'phyphox_experiments';
  const hec_protocol_placeholder = '$hec_protocol$';
  const hec_host_placeholder = '$hec_host$';
  const hec_port_placeholder = '$hec_port$';
  const hec_token_placeholder = '$hec_token$';

  var XMLContent = {};
  var modifiedXMLContent = {};

  /* create hidden a-tag to hold the XML blob */
  var a = document.createElement('a');
  a.id = "hidden-blob-a";
  document.body.appendChild(a);



  /* check the form, activate download button once all input fields are filled */
  $('#download_experiment').attr('disabled','disabled');
  const form = $('#form');
  form.on("change", () => {
    if (form[0].checkValidity() && $('#experimentFileDropdown').val().length > 0) {
      getAndCustomizeExperimentXML();
      $('#download_experiment').removeAttr('disabled');
    }
  });


  /* get the host from the URL and add it as value to the host form-field */
  var host = window.location.hostname;
  var inputField = document.getElementById('hec_host');
  if (inputField) {
    inputField.value = host;
  }


  /* get all available phyphox-experiment files from gitlab and add to dropdown */
  var apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlab_project_id)}/repository/tree?path=${encodeURIComponent(gitlab_subfolder_path)}`;
  $.ajax({
    url: apiUrl,
    method: 'GET',
    data: {
      recursive: false
    },
    success: function(data) {  
      var dropdown = $('#experimentFileDropdown');
      dropdown.empty();
      dropdown.append('<option value="">Select a file</option>');
      var filteredFiles = data.filter(function(file) {
        return file.name.endsWith('.phyphox'); // Filter files by .phyphox extension
      });
      if (filteredFiles.length > 0) {
        filteredFiles.forEach(function(file) {
          var option = $('<option></option>').attr('value', file.path).text(file.name);
          dropdown.append(option);
        });
      } else {
        dropdown.append('<option value="">No .phyphox files found</option>');
      }

      /* set form input values if GET params available */
      var urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
        if ($.inArray(key, ['hec_protocol', 'experimentFileDropdown'])) {
          $(`#${key}`).val(value).change();
        }
        if ($.inArray(key, ['hec_host', 'hec_port', 'hec_token'])) {
          $(`#${key}`).val(value);
        }
      });


    },
    error: function(xhr, status, error) {
      console.error('Error fetching files:', error);
      $('#experimentFileDropdown').append('<option value="">Error fetching files</option>');  }
  });


  
  function getAndCustomizeExperimentXML() {

    var experimentFile = $('#experimentFileDropdown').val();
    var experimentFileUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlab_project_id)}/repository/files/${encodeURIComponent(experimentFile)}/raw`;

    var hec_protocol = $('#hec_protocol').val();
    var hec_host = $('#hec_host').val();
    var hec_port = $('#hec_port').val();
    var hec_token = $('#hec_token').val();
    
    if ( !(experimentFile in XMLContent) ) {
      async function customizeXML() {
        try {
          var content = await downloadFile();
          XMLContent[experimentFile] = content;
          doXmlChanges();
        } catch (error) {
          console.error(error);
        }
      }
      customizeXML();
    } else {
      doXmlChanges();
    }

    function downloadFile() {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: experimentFileUrl,
          method: 'GET',
          xhrFields: {
            responseType: 'blob'
          },
          success: function(data) {
            var reader = new FileReader();
            reader.onload = function() {
              var content = reader.result; // content of file as text
              resolve(content);
            };
            reader.onerror = function() {
              reject('Error reading XML file');
            };            
            reader.readAsText(data); // read blob as text
          },
          error: function() {
            console.log('Failed to download file.');
          }
        });
      });
    }

    function doXmlChanges() {
      modifiedXMLContent[experimentFile] = XMLContent[experimentFile];
      replacePlaceholders();
      addHecHostToDescription();
      renderQRCode();
      updateHiddenAhref();
    }

    function replacePlaceholders() {
      /* Update the file content */
      modifiedXMLContent[experimentFile] = modifiedXMLContent[experimentFile].replace(hec_protocol_placeholder, hec_protocol).replace(hec_host_placeholder, hec_host).replace(hec_port_placeholder, hec_port).replace(hec_token_placeholder, hec_token);
    }

    function addHecHostToDescription() {
      /* Update the file content */
      modifiedXMLContent[experimentFile] = modifiedXMLContent[experimentFile].replace("<description>", `<description>${hec_host} - `);
    }

    function renderQRCode() {
      var url = `${window.location.href.split('?')[0]}?hec_protocol=${hec_protocol}&hec_host=${hec_host}&hec_port=${hec_port}&hec_token=${hec_token}&experimentFileDropdown=${experimentFile}`;
      $("#qrCode").html("");
      $('#qrCode').qrcode({width: 256,height: 256,text: url});
    }

    function updateHiddenAhref() {
      /* Create a Blob from the modified content */
      var blob = new Blob([modifiedXMLContent[experimentFile]], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      document.getElementById('hidden-blob-a').href = url;
      document.getElementById('hidden-blob-a').download = experimentFile;
    }

  }


  /* download click handler: when all params are set, download the phyphox file and replace the params in the file */
  $('#download_experiment').click(function(e) {
    e.preventDefault();
    document.getElementById('hidden-blob-a').click();
    /* reset the form */
    $('#form').trigger("reset");
    $('#download_experiment').attr('disabled','disabled');
  });


});
