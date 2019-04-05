package com.testapplication.sampleapp;

import java.net.URI;
import java.util.List;

import com.testapplication.sampleapp.model.SensorData;
import com.testapplication.sampleapp.service.DataService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import sun.nio.ch.sctp.SendFailed;


@RestController
public class DataController {

	@Autowired
	private DataService dataService;


	@GetMapping("/getDataByType")
	public List<SensorData> getDataByType(@RequestParam String type) {
		return  dataService.getDataByType(type);

	}

	//Todo tomas to correct request

	@PostMapping("/devicedata")
	public SensorData getDataByType(@RequestParam SensorData sensorData) {
		return  dataService.save(sensorData);

	}


	@RequestMapping("/testdata")
	public void getTestData() {
		final String uri = "http://localhost:8092/";
		RestTemplate restTemplate = new RestTemplate();
		String result = restTemplate.getForObject(uri, String.class);
		System.out.println("Called test data" + result);
		RestTemplate restTemplate1 = new RestTemplate();
		final String baseUrl = "http://localhost:" + 8092 + "/feedbackUrl/";
		try {
			URI postUri = new URI(baseUrl);
			Car car = new Car();
			car.setCarname("testcar");
			JSONObject json=new JSONObject();
			json.put("teja", "teja");
			ResponseEntity<String> result1 = restTemplate.postForEntity(postUri, car, String.class);
			System.out.println(result1.getBody().toString());
		} catch (Exception e) {

			e.printStackTrace();
		}

	}

	@PostMapping("/testpost")
	public String testPostApi(@RequestBody Car car) {
		System.out.println("Insidetemplate"+car);
		return "OK";
	}
	
	
	@PostMapping("/devicedata")
	public void String(@RequestBody String entity) {
		System.out.println(entity);
	}
	
	@GetMapping("/aboutToStart")
	public void String() {
//		
//		String url="http://192.168.1.223/putxml";
//		MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
//        headers.add("Content-Type", "text/xml");
//        headers.add("Authorization", "Basic b3JhY2xlaGFjazpvcmFjbGVoYWNr");
//		RestTemplate restTemplate = new RestTemplate();
//		String xmlRequest="<Command>\n" + 
//				"	<Dial>\n" + 
//				"		<Number>922421721@vaiiyer-sandbox.webex.com</Number>\n" + 
//				"	</Dial>\n" + 
//				"</Command>";
//		ResponseEntity entity = new RestTemplate().exchange(url, HttpMethod.POST, new HttpEntity<Object>(headers),String.class);
		
		
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "Basic b3JhY2xlaGFjazpvcmFjbGVoYWNr");	
		headers.setContentType(MediaType.APPLICATION_XML);
		String body="<Command> <Dial> <Number>922421721@vaiiyer-sandbox.webex.com</Number> </Dial> </Command>";
		HttpEntity<String> request = new HttpEntity<String>(body, headers);
		ResponseEntity<String> response = new RestTemplate().postForEntity("http://192.168.1.223/putxml", request, String.class);
		
		
		
		
		RestTemplate restTemplate1 = new RestTemplate();
	}
	

}
